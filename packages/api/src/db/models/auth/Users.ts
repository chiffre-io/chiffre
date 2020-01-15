import Knex from 'knex'
import { updatedAtFieldAutoUpdate } from '../../utility'
import { cloakValue, decloakValue, rotateTableCloak } from '../../encryption'
import { TwoFactorStatus } from '../../../auth/types'

export const USERS_TABLE = 'users'

interface UserInput {
  username: string

  // Auth - SRP
  masterSalt: string
  srpSalt: string
  srpVerifier: string

  // Auth - 2FA
  twoFactorStatus: TwoFactorStatus
  twoFactorSecret?: string
  twoFactorBackupCodes?: string // comma-separated array
}

export interface User extends UserInput {
  id: string
}

// --

export async function cloak(user: User | UserInput): Promise<User | UserInput> {
  return {
    ...user,
    srpSalt: await cloakValue(user.srpSalt),
    srpVerifier: await cloakValue(user.srpVerifier),
    masterSalt: await cloakValue(user.masterSalt),
    twoFactorSecret:
      user.twoFactorSecret && (await cloakValue(user.twoFactorSecret)),
    twoFactorBackupCodes:
      user.twoFactorBackupCodes && (await cloakValue(user.twoFactorBackupCodes))
  }
}

async function decloak(user: User): Promise<User> {
  return {
    ...user,
    srpSalt: await decloakValue(user.srpSalt),
    srpVerifier: await decloakValue(user.srpVerifier),
    masterSalt: await decloakValue(user.masterSalt),
    twoFactorSecret:
      user.twoFactorSecret && (await decloakValue(user.twoFactorSecret)),
    twoFactorBackupCodes:
      user.twoFactorBackupCodes &&
      (await decloakValue(user.twoFactorBackupCodes))
  }
}

export async function rotateUsersCloak(db: Knex) {
  return await rotateTableCloak(db, {
    tableName: USERS_TABLE,
    fields: [
      'srpSalt',
      'srpVerifier',
      'masterSalt',
      'twoFactorSecret',
      'twoFactorBackupCodes'
    ],
    cloak,
    decloak
  })
}

// --

export async function createUser(
  db: Knex,
  input: Omit<UserInput, 'twoFactorStatus'>
): Promise<User> {
  const user: UserInput = await cloak({
    ...input,
    twoFactorStatus: TwoFactorStatus.disabled,
    twoFactorSecret: null,
    twoFactorBackupCodes: null
  })
  const result = await db
    .insert(user)
    .into(USERS_TABLE)
    .returning<User[]>('*')
  return result[0]
}

export async function findUserByUsername(db: Knex, username: string) {
  const result = await db
    .select<User[]>('*')
    .from(USERS_TABLE)
    .where({ username })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return await decloak(result[0])
}

export async function findUser(db: Knex, userID: string) {
  const result = await db
    .select<User[]>('*')
    .from(USERS_TABLE)
    .where({ id: userID })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return await decloak(result[0])
}

// --

export async function enableTwoFactor(
  db: Knex,
  userID: string,
  secret: string
) {
  return await db<User>(USERS_TABLE)
    .where({
      id: userID
    })
    .update({
      twoFactorStatus: TwoFactorStatus.enabled,
      twoFactorSecret: await cloakValue(secret)
    })
}

export async function markTwoFactorVerified(
  db: Knex,
  userID: string,
  backupCodes: string[]
) {
  return await db<User>(USERS_TABLE)
    .where({
      id: userID,
      twoFactorStatus: TwoFactorStatus.enabled
    })
    .update({
      twoFactorStatus: TwoFactorStatus.verified,
      twoFactorBackupCodes: await cloakValue(backupCodes.join(','))
    })
}

export async function cancelTwoFactor(db: Knex, userID: string) {
  return await db<User>(USERS_TABLE)
    .where({
      id: userID
    })
    .update({
      twoFactorStatus: TwoFactorStatus.disabled,
      twoFactorSecret: null,
      twoFactorBackupCodes: null
    })
}

export async function disableTwoFactor(db: Knex, userID: string) {
  return await db<User>(USERS_TABLE)
    .where({
      id: userID,
      // Can only disable if verified
      twoFactorStatus: TwoFactorStatus.verified
    })
    .update({
      twoFactorStatus: TwoFactorStatus.disabled,
      twoFactorSecret: null,
      twoFactorBackupCodes: null
    })
}

export async function consumeBackupCode(
  db: Knex,
  userID: string,
  code: string
) {
  const user = await findUser(db, userID)
  const codes = (user.twoFactorBackupCodes || '').split(',')
  if (codes.length === 0) {
    throw new Error('No backup codes available')
  }
  if (!codes.includes(code)) {
    throw new Error('Invalid backup code')
  }
  const newCodes = codes.filter(c => c !== code).join(',')
  return await db<User>(USERS_TABLE)
    .where({ id: userID })
    .update({
      twoFactorBackupCodes: await cloakValue(newCodes)
    })
}

// --

export async function createInitialUsersTable(db: Knex) {
  await db.schema.createTable(USERS_TABLE, table => {
    table.timestamps(true, true)
    table
      .string('id')
      .unique()
      .notNullable()
      .defaultTo(db.raw('generate_b64id()'))
      .primary()
    table
      .string('username')
      .unique()
      .notNullable()
      .index()

    // Auth - SRP
    table.text('srpSalt').notNullable()
    table.text('srpVerifier').notNullable()
    table.text('masterSalt').notNullable()

    // Auth - 2FA
    table
      .enum('twoFactorStatus', [
        TwoFactorStatus.disabled,
        TwoFactorStatus.enabled,
        TwoFactorStatus.verified
      ])
      .notNullable()
      .defaultTo(TwoFactorStatus.disabled)
    table
      .text('twoFactorSecret')
      .nullable()
      .defaultTo(null)
    table
      .text('twoFactorBackupCodes')
      .nullable()
      .defaultTo(null)
  })
  await updatedAtFieldAutoUpdate(db, USERS_TABLE)
}
