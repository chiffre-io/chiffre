import Knex from 'knex'
import { USERS_AUTH_SRP_TABLE } from '../auth/UsersAuthSRP'
import { updatedAtFieldAutoUpdate } from '~/src/server/db/utility'

export const KEYCHAINS_TABLE = 'keychains'

export interface KeychainRecord {
  userID: string
  key: string
  signaturePublicKey: string
  signatureSecretKey: string
  sharingPublicKey: string
  sharingSecretKey: string
}

export interface KeychainUpdatableFields {
  key?: string
  signaturePublicKey?: string
  sharingPublicKey?: string
}

// --

export const createKeychainRecord = async (
  db: Knex,
  record: KeychainRecord
) => {
  return await db.insert(record).into(KEYCHAINS_TABLE)
}

// --

export const findKeychain = async (
  db: Knex,
  userID: string
): Promise<KeychainRecord> => {
  const result = await db
    .select<KeychainRecord[]>('*')
    .from(KEYCHAINS_TABLE)
    .where({ userID })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return result[0]
}

// --

export const updateKeychain = async (
  db: Knex,
  userID: string,
  updates: KeychainUpdatableFields
) => {
  return await db(KEYCHAINS_TABLE)
    .where({ userID })
    .update(updates)
}

// --

export const createInitialKeychainsTable = async (db: Knex) => {
  await db.schema.createTable(KEYCHAINS_TABLE, table => {
    table.timestamps(true, true)
    table
      .uuid('userID')
      .notNullable()
      .primary()
    table.foreign('userID').references(`${USERS_AUTH_SRP_TABLE}.id`)
    table.string('key').notNullable()
    table.string('signaturePublicKey').notNullable()
    table.string('sharingPublicKey').notNullable()
    table.text('signatureSecretKey').notNullable()
    table.text('sharingSecretKey').notNullable()
  })
  await updatedAtFieldAutoUpdate(db, KEYCHAINS_TABLE)
}
