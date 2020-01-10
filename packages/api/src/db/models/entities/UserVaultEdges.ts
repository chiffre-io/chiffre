import Knex from 'knex'
import { updatedAtFieldAutoUpdate } from '../../utility'
import { USERS_TABLE } from '../auth/Users'
import { VAULTS_TABLE } from './Vaults'

export const USER_VAULT_EDGES_TABLE = 'user_vault_edges'

export interface UserVaultEdgeInput {
  userID: string
  vaultID: string
  vaultKey: string // Encrypted with the user's Keychain key
}

export interface UserVaultEdge extends UserVaultEdgeInput {
  id: string
}

// --

export async function createUserVaultEdge(
  db: Knex,
  userID: string,
  vaultID: string,
  vaultKey: string
): Promise<UserVaultEdge> {
  const edge: UserVaultEdgeInput = {
    userID,
    vaultID,
    vaultKey
  }
  const result = await db
    .insert(edge)
    .into(USER_VAULT_EDGES_TABLE)
    .returning<UserVaultEdge[]>('*')
  return result[0]
}

export async function findVaultEdgesForUser(
  db: Knex,
  userID: string
): Promise<UserVaultEdge[]> {
  return await db
    .select<UserVaultEdge[]>('*')
    .from(USER_VAULT_EDGES_TABLE)
    .where({ userID })
}

export async function findUserEdgesWhoShareVault(
  db: Knex,
  vaultID: string
): Promise<UserVaultEdge[]> {
  return await db
    .select<UserVaultEdge[]>('*')
    .from(USER_VAULT_EDGES_TABLE)
    .where({ vaultID })
}

// todo: Update edge key when rotating either the keychain key or vault key.

// --

export async function createInitialUserVaultEdgesTable(db: Knex) {
  await db.schema.createTable(USER_VAULT_EDGES_TABLE, table => {
    table.timestamps(true, true)
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
      .string('vaultID')
      .notNullable()
      .index()
    table.foreign('vaultID').references(`${VAULTS_TABLE}.id`)
    table.string('vaultKey').notNullable()
  })
  await updatedAtFieldAutoUpdate(db, USER_VAULT_EDGES_TABLE)
}
