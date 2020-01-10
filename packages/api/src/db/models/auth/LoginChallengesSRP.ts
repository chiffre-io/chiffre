import Knex from 'knex'
import { USERS_TABLE } from './Users'
import { expirationTimes } from '../../../config'

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

export async function saveLoginChallenge(
  db: Knex,
  userID: string,
  ephemeralSecret: string,
  now: Date = new Date()
): Promise<string> {
  const challenge: LoginChallengeSrpInput = {
    userID,
    ephemeralSecret,
    expiresAt: expirationTimes.inFiveMinutes(now)
  }
  const result = await db
    .insert(challenge)
    .into(LOGIN_CHALLENGES_SRP_TABLE)
    .returning<string[]>('id')
  return result[0]
}

export async function findLoginChallenge(db: Knex, id: string) {
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

export async function deleteLoginChallenge(db: Knex, id: string) {
  return await db
    .from(LOGIN_CHALLENGES_SRP_TABLE)
    .where({ id })
    .delete()
}

export function isChallengeExpired(
  challenge: LoginChallengeSrp,
  now: Date = new Date()
) {
  return challenge.expiresAt < now
}

// --

export async function getAllExpiredLoginChallenges(
  db: Knex,
  before: Date = new Date()
) {
  return await db
    .select<LoginChallengeSrp[]>('*')
    .from(LOGIN_CHALLENGES_SRP_TABLE)
    .where('expiresAt', '<', before)
}

// --

export async function createInitialLoginChallengesSrpTable(db: Knex) {
  await db.schema.createTable(LOGIN_CHALLENGES_SRP_TABLE, table => {
    table.timestamp('created_at').defaultTo(db.fn.now())
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

    table
      .string('ephemeralSecret')
      .unique()
      .notNullable()
    table.timestamp('expiresAt').notNullable()
  })
}
