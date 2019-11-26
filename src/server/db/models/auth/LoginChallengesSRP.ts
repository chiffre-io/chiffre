import Knex from 'knex'
import { USERS_AUTH_SRP_TABLE } from './UsersAuthSRP'

export const LOGIN_CHALLENGES_SRP_TABLE = 'login_challenges_srp'

interface LoginChallengeSrpInput {
  userID: string
  ephemeralSecret: string
  expiresAt: Date
}

export interface LoginChallengeSrp extends LoginChallengeSrpInput {
  id: string
}

// --

export const saveLoginChallenge = async (
  db: Knex,
  userID: string,
  ephemeralSecret: string,
  now: Date = new Date()
): Promise<string> => {
  const challenge: LoginChallengeSrpInput = {
    userID,
    ephemeralSecret,
    expiresAt: new Date(now.getTime() + 5 * 60 * 1000) // in 5 minutes
  }
  const result = await db
    .insert(challenge)
    .into(LOGIN_CHALLENGES_SRP_TABLE)
    .returning<string[]>('id')
  return result[0]
}

export const findLoginChallenge = async (db: Knex, id: string) => {
  const result = await db
    .select<LoginChallengeSrp[]>('*')
    .from(LOGIN_CHALLENGES_SRP_TABLE)
    .where({ id })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return result[0]
}

export const deleteLoginChallenge = async (db: Knex, id: string) => {
  return await db
    .from(LOGIN_CHALLENGES_SRP_TABLE)
    .where({ id })
    .delete()
}

export const isChallengeExpired = (
  challenge: LoginChallengeSrp,
  now: Date = new Date()
) => {
  return challenge.expiresAt < now
}

// --

export const getAllExpiredLoginChallenges = async (
  db: Knex,
  before: Date = new Date()
) => {
  return await db
    .select<LoginChallengeSrp[]>('*')
    .from(LOGIN_CHALLENGES_SRP_TABLE)
    .where('expiresAt', '<', before)
}

// --

export const createInitialLoginChallengesSrpTable = async (db: Knex) => {
  await db.schema.createTable(LOGIN_CHALLENGES_SRP_TABLE, table => {
    table.timestamp('created_at').defaultTo(db.fn.now())
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

    table
      .string('ephemeralSecret')
      .unique()
      .notNullable()
    table.timestamp('expiresAt').notNullable()
  })
}
