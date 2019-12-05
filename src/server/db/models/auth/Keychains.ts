import Knex from 'knex'
import { USERS_AUTH_SRP_TABLE } from './UsersAuthSRP'
import { updatedAtFieldAutoUpdate } from '~/src/server/db/utility'

export const KEYCHAINS_TABLE = 'keychains'

export interface KeychainRecord {
  userID: string
  key: string
  encrypted: string
  signaturePublicKey: string
  sharingPublicKey: string
}

export interface KeychainUpdatableFields {
  encrypted: string // Always required (will always change)
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

export const getKeychain = async (
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
    table.text('key').notNullable()
    table.text('encrypted').notNullable()
    table.string('signaturePublicKey').notNullable()
    table.string('sharingPublicKey').notNullable()
  })
  await updatedAtFieldAutoUpdate(db, KEYCHAINS_TABLE)
}
