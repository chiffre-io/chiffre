import Knex from 'knex'
import { USERS_AUTH_SRP_TABLE } from './UsersAuthSRP'
import { userRequiresTwoFactorAuth } from './UsersAuthSettings'
import { updatedAtFieldAutoUpdate } from '~/src/server/db/utility'
import { expirationTimes } from '~/src/shared/config'

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

export const createSession = async (
  db: Knex,
  userID: string,
  twoFactorRequired: boolean,
  ipAddress: string,
  now: Date = new Date()
): Promise<Session> => {
  const session: SessionInput = {
    userID,
    twoFactorVerified: twoFactorRequired ? false : null,
    ipAddress,
    expiresAt: expirationTimes.inSevenDays(now)
  }
  const result = await db
    .insert(session)
    .into(SESSIONS_TABLE)
    .returning<Session[]>('*')
  return result[0]
}

export const findSession = async (db: Knex, id: string) => {
  const result = await db
    .select<Session[]>('*')
    .from(SESSIONS_TABLE)
    .where({ id })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return result[0]
}

export const markTwoFactorVerifiedInSession = async (db: Knex, id: string) => {
  await db(SESSIONS_TABLE)
    .where({ id })
    .update({ twoFactorVerified: true })
}

export const isSessionExpired = (session: Session, now: Date = new Date()) => {
  return session.expiresAt < now
}

export const isSessionValid = async (db: Knex, id: string, userID: string) => {
  const session = await findSession(db, id)
  if (!session) {
    return false
  }
  if (isSessionExpired(session)) {
    return false
  }
  if (session.userID !== userID) {
    return false
  }
  const twoFactorRequired = await userRequiresTwoFactorAuth(db, session.userID)
  if (twoFactorRequired) {
    return session.twoFactorVerified
  }
  return true
}

export const deleteSession = async (db: Knex, id: string, userID: string) => {
  return await db
    .from(SESSIONS_TABLE)
    .where({ id, userID })
    .delete()
}

export const getAllSessionsForUser = async (db: Knex, userID: string) => {
  return await db
    .select<(Session & { created_at: Date })[]>('*')
    .from(SESSIONS_TABLE)
    .where({ userID })
}

// --

export const createInitialSessionsTable = async (db: Knex) => {
  await db.schema.createTable(SESSIONS_TABLE, table => {
    table.timestamps(true, true)
    table
      .uuid('id')
      .unique()
      .notNullable()
      .defaultTo(db.raw('uuid_generate_v4()'))
      .primary()
    table
      .uuid('userID')
      .notNullable()
      .index()
    table.foreign('userID').references(`${USERS_AUTH_SRP_TABLE}.id`)
    table.string('ipAddress').notNullable()
    table.boolean('twoFactorVerified').nullable()
    table.timestamp('expiresAt').notNullable()
  })
  await updatedAtFieldAutoUpdate(db, SESSIONS_TABLE)
}
