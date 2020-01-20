import Knex from 'knex'
import { updatedAtFieldAutoUpdate } from '../../utility'
import { USERS_TABLE } from '../auth/Users'

export const VAULTS_TABLE = 'vaults'

interface VaultInput {
  createdBy: string // userID
}

export interface Vault extends VaultInput {
  id: string
}

// --

export async function createVault(db: Knex, createdBy: string): Promise<Vault> {
  const vault: VaultInput = {
    createdBy
  }
  const result = await db
    .insert(vault)
    .into(VAULTS_TABLE)
    .returning<Vault[]>('*')
  return result[0]
}

export async function findVault(db: Knex, id: string) {
  const result = await db
    .select<Vault[]>('*')
    .from(VAULTS_TABLE)
    .where({ id })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return result[0]
}

export async function deleteVault(db: Knex, id: string) {
  return await db
    .from(VAULTS_TABLE)
    .where({ id })
    .delete()
}

// --

export async function createInitialVaultsTable(db: Knex) {
  await db.schema.createTable(VAULTS_TABLE, table => {
    table.timestamps(true, true)
    table
      .string('id')
      .unique()
      .notNullable()
      .defaultTo(db.raw('generate_b64id()'))
      .primary()
    table
      .string('createdBy')
      .notNullable()
      .index()
    table.foreign('createdBy').references(`${USERS_TABLE}.id`)
  })
  await updatedAtFieldAutoUpdate(db, VAULTS_TABLE)
}
