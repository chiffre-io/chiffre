import Knex from 'knex'
import { updatedAtFieldAutoUpdate } from '~/src/server/db/utility'
import {
  cloakValue,
  decloakValue,
  rotateTableCloak
} from '~/src/server/db/encryption'
import { USERS_TABLE } from './Users'
import { VAULTS_TABLE } from '../entities/Vaults'

export const TOKENS_TABLE = 'tokens'

interface TokenInput {
  fingerprint: string
  key: string

  // Auth - SRP
  masterSalt: string
  srpSalt: string
  srpVerifier: string

  // Relationships
  createdBy: string
  vaultID: string
}

export interface Token extends TokenInput {
  id: string
}

// --

export const cloak = async (
  token: Token | TokenInput
): Promise<Token | TokenInput> => {
  return {
    ...token,
    srpSalt: await cloakValue(token.srpSalt),
    srpVerifier: await cloakValue(token.srpVerifier),
    masterSalt: await cloakValue(token.masterSalt)
  }
}

const decloak = async (token: Token): Promise<Token> => {
  return {
    ...token,
    srpSalt: await decloakValue(token.srpSalt),
    srpVerifier: await decloakValue(token.srpVerifier),
    masterSalt: await decloakValue(token.masterSalt)
  }
}

export const rotateTokensCloak = async (db: Knex) => {
  return await rotateTableCloak(db, {
    tableName: TOKENS_TABLE,
    fields: ['srpSalt', 'srpVerifier', 'masterSalt'],
    cloak,
    decloak
  })
}

// --

export const createToken = async (
  db: Knex,
  input: TokenInput
): Promise<Token> => {
  const token: TokenInput = await cloak(input)
  const result = await db
    .insert(token)
    .into(TOKENS_TABLE)
    .returning<Token[]>('*')
  return result[0]
}

export const findTokenByFingerprint = async (db: Knex, fingerprint: string) => {
  const result = await db
    .select<Token[]>('*')
    .from(TOKENS_TABLE)
    .where({ fingerprint })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return await decloak(result[0])
}

export const findToken = async (db: Knex, tokenID: string) => {
  const result = await db
    .select<Token[]>('*')
    .from(TOKENS_TABLE)
    .where({ id: tokenID })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return await decloak(result[0])
}

export const deleteToken = async (db: Knex, tokenID: string) => {
  return await db(TOKENS_TABLE)
    .where({ id: tokenID })
    .delete()
}

// --

export const createInitialTokensTable = async (db: Knex) => {
  await db.schema.createTable(TOKENS_TABLE, table => {
    table.timestamps(true, true)
    table
      .string('id')
      .unique()
      .notNullable()
      .defaultTo(db.raw('generate_b64id()'))
      .primary()
    table
      .string('fingerprint')
      .unique()
      .notNullable()
      .index()
    table.string('key').notNullable()

    // Auth - SRP
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

    table.string('createdBy').notNullable()
    table.foreign('createdBy').references(`${USERS_TABLE}.id`)

    table.string('vaultID').notNullable()
    table.foreign('vaultID').references(`${VAULTS_TABLE}.id`)
  })
  await updatedAtFieldAutoUpdate(db, TOKENS_TABLE)
}
