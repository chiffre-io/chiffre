import Knex from 'knex'
import { USERS_AUTH_SRP_TABLE } from './UsersAuthSRP'
import { userRequiresTwoFactorAuth } from './UsersAuthSettings'

export const SESSIONS_TABLE = 'sessions'

interface SessionInput {
  userID: string
  totpVerified?: boolean
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
  now: Date = new Date()
): Promise<Session> => {
  const session: SessionInput = {
    userID,
    totpVerified: twoFactorRequired ? false : null,
    ipAddress,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // in 7 days
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

export const markTotpVerifiedInSession = async (db: Knex, id: string) => {
  await db(SESSIONS_TABLE)
    .where({ id })
    .update({ totpVerified: true })
}

export const isSessionExpired = (session: Session, now: Date = new Date()) => {
  return session.expiresAt < now
}

export const isSessionValid = async (db: Knex, id: string) => {
  const session = await findSession(db, id)
  if (!session) {
    return false
  }
  if (isSessionExpired(session)) {
    return false
  }
  const twoFactorRequired = await userRequiresTwoFactorAuth(db, session.userID)
  if (twoFactorRequired) {
    return session.totpVerified
  }
  return true
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
    table.boolean('totpVerified').nullable()
    table.timestamp('expiresAt').notNullable()
  })
}
