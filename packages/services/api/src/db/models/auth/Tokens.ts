import Knex from 'knex'
import { updatedAtFieldAutoUpdate } from '../../utility'
import { cloakValue, decloakValue, rotateTableCloak } from '../../encryption'
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

export async function cloak(
  token: Token | TokenInput
): Promise<Token | TokenInput> {
  return {
    ...token,
    srpSalt: await cloakValue(token.srpSalt),
    srpVerifier: await cloakValue(token.srpVerifier),
    masterSalt: await cloakValue(token.masterSalt)
  }
}

async function decloak(token: Token): Promise<Token> {
  return {
    ...token,
    srpSalt: await decloakValue(token.srpSalt),
    srpVerifier: await decloakValue(token.srpVerifier),
    masterSalt: await decloakValue(token.masterSalt)
  }
}

export async function rotateTokensCloak(db: Knex) {
  return await rotateTableCloak(db, {
    tableName: TOKENS_TABLE,
    fields: ['srpSalt', 'srpVerifier', 'masterSalt'],
    cloak,
    decloak
  })
}

// --

export async function createToken(db: Knex, input: TokenInput): Promise<Token> {
  const token: TokenInput = await cloak(input)
  const result = await db
    .insert(token)
    .into(TOKENS_TABLE)
    .returning<Token[]>('*')
  return result[0]
}

export async function findTokenByFingerprint(db: Knex, fingerprint: string) {
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

export async function findToken(db: Knex, tokenID: string) {
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

export async function deleteToken(db: Knex, tokenID: string) {
  return await db(TOKENS_TABLE)
    .where({ id: tokenID })
    .delete()
}

// --

export async function createInitialTokensTable(db: Knex) {
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
    table.text('srpSalt').notNullable()
    table.text('srpVerifier').notNullable()
    table.text('masterSalt').notNullable()

    table.string('createdBy').notNullable()
    table.foreign('createdBy').references(`${USERS_TABLE}.id`)

    table.string('vaultID').notNullable()
    table.foreign('vaultID').references(`${VAULTS_TABLE}.id`)
  })
  await updatedAtFieldAutoUpdate(db, TOKENS_TABLE)
}
