import Knex from 'knex'
import { USERS_TABLE, userRequiresTwoFactorAuth } from './Users'
import { updatedAtFieldAutoUpdate } from '~/src/server/db/utility'
import { expirationTimes } from '~/src/shared/config'
import { cloakValue, decloakValue } from '~/src/server/db/encryption'
import { rotateTableCloak } from '../../encryption'

export const SESSIONS_TABLE = 'sessions'

interface SessionInput {
  userID: string
  twoFactorVerified?: boolean
  expiresAt: Date
  ipAddress: string
}

export interface Session extends SessionInput {
  id: string
}

// --

const cloak = async <T extends SessionInput>(session: T): Promise<T> => {
  return {
    ...session,
    ipAddress: await cloakValue(session.ipAddress)
  }
}

const decloak = async <T extends SessionInput>(session: T): Promise<T> => {
  return {
    ...session,
    ipAddress: await decloakValue(session.ipAddress)
  }
}

export const rotateSessionsCloak = async (db: Knex) => {
  return await rotateTableCloak(db, {
    tableName: SESSIONS_TABLE,
    fields: ['ipAddress'],
    cloak,
    decloak
  })
}

// --

export const createSession = async (
  db: Knex,
  userID: string,
  twoFactorRequired: boolean,
  ipAddress: string,
  now: Date = new Date()
): Promise<Session> => {
  const session: SessionInput = await cloak({
    userID,
    twoFactorVerified: twoFactorRequired ? false : null,
    ipAddress,
    expiresAt: expirationTimes.inSevenDays(now)
  })
  const result = await db
    .insert(session)
    .into(SESSIONS_TABLE)
    .returning<Session[]>('*')
  return result[0]
}

export const findSession = async (db: Knex, id: string, decloakIp = false) => {
  const result = await db
    .select<Session[]>('*')
    .from(SESSIONS_TABLE)
    .where({ id })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return decloakIp ? await decloak(result[0]) : result[0]
}

export const markTwoFactorVerifiedInSession = async (db: Knex, id: string) => {
  await db(SESSIONS_TABLE)
    .where({ id })
    .update({ twoFactorVerified: true })
}

export const isSessionExpired = (session: Session, now: Date = new Date()) => {
  return session.expiresAt < now
}

export const isSessionValid = async (
  db: Knex,
  id: string,
  skipTwoFactorCheck = false
) => {
  const session = await findSession(db, id)
  if (!session) {
    return false
  }
  if (isSessionExpired(session)) {
    return false
  }
  if (skipTwoFactorCheck) {
    return session
  }
  const twoFactorRequired = await userRequiresTwoFactorAuth(db, session.userID)
  if (twoFactorRequired) {
    return session.twoFactorVerified ? session : false
  }
  return session
}

export const deleteSession = async (db: Knex, id: string, userID: string) => {
  return await db
    .from(SESSIONS_TABLE)
    .where({ id, userID })
    .delete()
}

export const getAllSessionsForUser = async (
  db: Knex,
  userID: string
): Promise<(Session & { created_at: Date })[]> => {
  const results = await db
    .select<(Session & { created_at: Date })[]>('*')
    .from(SESSIONS_TABLE)
    .where({ userID })
  return await Promise.all(results.map(r => decloak(r)))
}

// --

export const createInitialSessionsTable = async (db: Knex) => {
  await db.schema.createTable(SESSIONS_TABLE, table => {
    table.timestamps(true, true)
    table
      .string('id')
      .unique()
      .notNullable()
      .defaultTo(db.raw('generate_b64id()'))
      .primary()
    table
      .string('userID')
      .notNullable()
      .index()
    table.foreign('userID').references(`${USERS_TABLE}.id`)
    table.text('ipAddress').notNullable()
    table.boolean('twoFactorVerified').nullable()
    table.timestamp('expiresAt').notNullable()
  })
  await updatedAtFieldAutoUpdate(db, SESSIONS_TABLE)
}
