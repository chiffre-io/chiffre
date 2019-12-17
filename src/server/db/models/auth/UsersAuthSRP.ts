import Knex from 'knex'
import { updatedAtFieldAutoUpdate } from '~/src/server/db/utility'
import {
  cloakValue,
  decloakValue,
  getCurrentCloakPrefix
} from '../../encryption'

export const USERS_AUTH_SRP_TABLE = 'users_auth_srp'

interface UserAuthSrpInput {
  username: string
  srpSalt: string
  srpVerifier: string
  masterSalt: string
}

export interface UserAuthSrp extends UserAuthSrpInput {
  id: string
}

// --

export const cloak = async (
  user: UserAuthSrpInput
): Promise<UserAuthSrpInput> => {
  return {
    ...user,
    srpSalt: await cloakValue(user.srpSalt),
    srpVerifier: await cloakValue(user.srpVerifier),
    masterSalt: await cloakValue(user.masterSalt)
  }
}

const decloak = async (user: UserAuthSrp): Promise<UserAuthSrp> => {
  return {
    ...user,
    srpSalt: await decloakValue(user.srpSalt),
    srpVerifier: await decloakValue(user.srpVerifier),
    masterSalt: await decloakValue(user.masterSalt)
  }
}

export const rotateUsersAuthSrpCloak = async (db: Knex) => {
  const prefix = getCurrentCloakPrefix()
  const oldRecords = await db
    .select<UserAuthSrp[]>('*')
    .from(USERS_AUTH_SRP_TABLE)
    .whereRaw(
      `
    not "srpSalt" like '${prefix}%'
 or not "srpVerifier" like '${prefix}%'
 or not "masterSalt" like '${prefix}%'`
    )
  // .limit(100)
  let processed = []
  let errors = []
  for (const record of oldRecords) {
    try {
      const newRecord = await cloak(await decloak(record))
      await db(USERS_AUTH_SRP_TABLE)
        .update(newRecord)
        .where({
          // Match ID and old fields to avoid race conditions
          id: record.id,
          srpSalt: record.srpSalt,
          srpVerifier: record.srpVerifier,
          masterSalt: record.masterSalt
        })
      processed.push(record.id)
    } catch (error) {
      errors.push({ userID: record.id, error: error.message })
    }
  }
  return { processed, errors }
}

// --

export const createUser = async (
  db: Knex,
  username: string,
  srpSalt: string,
  srpVerifier: string,
  masterSalt: string
): Promise<string> => {
  const user: UserAuthSrpInput = await cloak({
    username,
    srpSalt,
    srpVerifier,
    masterSalt
  })
  const result = await db
    .insert(user)
    .into(USERS_AUTH_SRP_TABLE)
    .returning<string[]>('id')
  return result[0]
}

export const findUserByUsername = async (db: Knex, username: string) => {
  const result = await db
    .select<UserAuthSrp[]>('*')
    .from(USERS_AUTH_SRP_TABLE)
    .where({ username })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return await decloak(result[0])
}

export const findUser = async (db: Knex, userID: string) => {
  const result = await db
    .select<UserAuthSrp[]>('*')
    .from(USERS_AUTH_SRP_TABLE)
    .where({ id: userID })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return await decloak(result[0])
}

// --

export const createInitialUsersAuthSrpTable = async (db: Knex) => {
  await db.schema.createTable(USERS_AUTH_SRP_TABLE, table => {
    table.timestamps(true, true)
    table
      .uuid('id')
      .unique()
      .notNullable()
      .defaultTo(db.raw('uuid_generate_v4()'))
      .primary()
    table
      .string('username')
      .unique()
      .notNullable()
      .index()
    table
      .text('srpSalt')
      .unique()
      .notNullable()
    table
      .text('srpVerifier')
      .unique()
      .notNullable()
    table
      .text('masterSalt')
      .unique()
      .notNullable()
  })
  await updatedAtFieldAutoUpdate(db, USERS_AUTH_SRP_TABLE)
}
