import Knex from 'knex'
import { updatedAtFieldAutoUpdate } from '~/src/server/db/utility'
import { USERS_AUTH_SRP_TABLE } from '../auth/UsersAuthSRP'
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

export const createUserVaultEdge = async (
  db: Knex,
  userID: string,
  vaultID: string,
  vaultKey: string
): Promise<UserVaultEdge> => {
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

export const findVaultEdgesForUser = async (
  db: Knex,
  userID: string
): Promise<UserVaultEdge[]> => {
  return await db
    .select<UserVaultEdge[]>('*')
    .from(USER_VAULT_EDGES_TABLE)
    .where({ userID })
}

export const findUserEdgesWhoShareVault = async (
  db: Knex,
  vaultID: string
): Promise<UserVaultEdge[]> => {
  return await db
    .select<UserVaultEdge[]>('*')
    .from(USER_VAULT_EDGES_TABLE)
    .where({ vaultID })
}

// todo: Update edge key when rotating either the keychain key or vault key.

// --

export const createInitialUserVaultEdgesTable = async (db: Knex) => {
  await db.schema.createTable(USER_VAULT_EDGES_TABLE, table => {
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
    table
      .uuid('vaultID')
      .notNullable()
      .index()
    table.foreign('vaultID').references(`${VAULTS_TABLE}.id`)
    table.string('vaultKey').notNullable()
  })
  await updatedAtFieldAutoUpdate(db, USER_VAULT_EDGES_TABLE)
}
