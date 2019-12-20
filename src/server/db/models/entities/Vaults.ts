import Knex from 'knex'
import { updatedAtFieldAutoUpdate } from '~/src/server/db/utility'
import { USERS_AUTH_SRP_TABLE } from '../auth/UsersAuthSRP'

export const VAULTS_TABLE = 'vaults'

interface VaultInput {
  encrypted: string
  createdBy: string // userID
}

export interface Vault extends VaultInput {
  id: string
}

// --

export const createVault = async (
  db: Knex,
  encrypted: string,
  createdBy: string
): Promise<Vault> => {
  const vault: VaultInput = {
    encrypted,
    createdBy
  }
  const result = await db
    .insert(vault)
    .into(VAULTS_TABLE)
    .returning<Vault[]>('*')
  return result[0]
}

export const findVault = async (db: Knex, id: string) => {
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

export const updateVault = async (db: Knex, id: string, encrypted: string) => {
  return await db<Vault>(VAULTS_TABLE)
    .update({ encrypted })
    .where({ id })
}

export const deleteVault = async (db: Knex, id: string) => {
  return await db
    .from(VAULTS_TABLE)
    .where({ id })
    .delete()
}

// --

export const createInitialVaultsTable = async (db: Knex) => {
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
    table.foreign('createdBy').references(`${USERS_AUTH_SRP_TABLE}.id`)
    table.text('encrypted').notNullable()
  })
  await updatedAtFieldAutoUpdate(db, VAULTS_TABLE)
}
