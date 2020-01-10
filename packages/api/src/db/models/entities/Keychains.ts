import Knex from 'knex'
import { USERS_TABLE } from '../auth/Users'
import { updatedAtFieldAutoUpdate } from '../../utility'

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

export async function createKeychainRecord(db: Knex, record: KeychainRecord) {
  return await db.insert(record).into(KEYCHAINS_TABLE)
}

// --

export async function findKeychain(
  db: Knex,
  userID: string
): Promise<KeychainRecord> {
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

export async function updateKeychain(
  db: Knex,
  userID: string,
  updates: KeychainUpdatableFields
) {
  return await db(KEYCHAINS_TABLE)
    .where({ userID })
    .update(updates)
}

// --

export async function createInitialKeychainsTable(db: Knex) {
  await db.schema.createTable(KEYCHAINS_TABLE, table => {
    table.timestamps(true, true)
    table
      .string('userID')
      .notNullable()
      .primary()
    table.foreign('userID').references(`${USERS_TABLE}.id`)
    table.string('key').notNullable()
    table.string('signaturePublicKey').notNullable()
    table.string('sharingPublicKey').notNullable()
    table.text('signatureSecretKey').notNullable()
    table.text('sharingSecretKey').notNullable()
  })
  await updatedAtFieldAutoUpdate(db, KEYCHAINS_TABLE)
}
