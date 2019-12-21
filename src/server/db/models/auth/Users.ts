import Knex from 'knex'
import { updatedAtFieldAutoUpdate } from '~/src/server/db/utility'
import {
  cloakValue,
  decloakValue,
  rotateTableCloak
} from '~/src/server/db/encryption'

export const USERS_TABLE = 'users'

interface UserInput {
  username: string

  // Auth - SRP
  masterSalt: string
  srpSalt: string
  srpVerifier: string

  // Auth - 2FA
  twoFactorEnabled: boolean
  twoFactorVerified: boolean
  twoFactorSecret?: string
  twoFactorBackupCodes?: string // comma-separated array
}

export interface User extends UserInput {
  id: string
}

export interface TwoFactorSettings {
  enabled: boolean
  verified: boolean
  secret?: string
  backupCodes?: string[]
}

// --

export const cloak = async (
  user: User | UserInput
): Promise<User | UserInput> => {
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

const decloak = async (user: User): Promise<User> => {
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

export const rotateUsersCloak = async (db: Knex) => {
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

export const createUser = async (
  db: Knex,
  input: Omit<UserInput, 'twoFactorEnabled' | 'twoFactorVerified'>
): Promise<User> => {
  const user: UserInput = await cloak({
    ...input,
    twoFactorEnabled: false,
    twoFactorVerified: false,
    twoFactorSecret: null,
    twoFactorBackupCodes: null
  })
  const result = await db
    .insert(user)
    .into(USERS_TABLE)
    .returning<User[]>('*')
  return result[0]
}

export const findUserByUsername = async (db: Knex, username: string) => {
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

export const findUser = async (db: Knex, userID: string) => {
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

export const findTwoFactorSettings = async (
  db: Knex,
  userID: string
): Promise<TwoFactorSettings> => {
  const result = await db
    .select<User[]>('*')
    .from(USERS_TABLE)
    .where({ id: userID })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  const {
    twoFactorEnabled,
    twoFactorSecret,
    twoFactorVerified,
    twoFactorBackupCodes
  } = await decloak(result[0])
  return {
    enabled: twoFactorEnabled,
    secret: twoFactorSecret,
    verified: twoFactorVerified,
    backupCodes: twoFactorBackupCodes && twoFactorBackupCodes.split(',')
  }
}

export const userRequiresTwoFactorAuth = async (db: Knex, userID: string) => {
  const settings = await findTwoFactorSettings(db, userID)
  if (!settings) {
    return null
  }
  return settings.verified
}

// --

export const enableTwoFactor = async (
  db: Knex,
  userID: string,
  secret: string
) => {
  return await db<User>(USERS_TABLE)
    .where({
      id: userID
    })
    .update({
      twoFactorEnabled: true,
      twoFactorVerified: false,
      twoFactorSecret: await cloakValue(secret)
    })
}

export const markTwoFactorVerified = async (
  db: Knex,
  userID: string,
  backupCodes: string[]
) => {
  return await db<User>(USERS_TABLE)
    .where({
      id: userID,
      twoFactorEnabled: true
    })
    .update({
      twoFactorVerified: true,
      twoFactorBackupCodes: await cloakValue(backupCodes.join(','))
    })
}

export const cancelTwoFactor = async (db: Knex, userID: string) => {
  return await db<User>(USERS_TABLE)
    .where({
      id: userID
    })
    .update({
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      twoFactorEnabled: false,
      twoFactorVerified: false
    })
}

export const disableTwoFactor = async (db: Knex, userID: string) => {
  return await db<User>(USERS_TABLE)
    .where({
      id: userID,
      twoFactorEnabled: true,
      twoFactorVerified: true // Can only disable if verified
    })
    .update({
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      twoFactorEnabled: false,
      twoFactorVerified: false
    })
}

export const consumeBackupCode = async (
  db: Knex,
  userID: string,
  code: string
) => {
  const settings = await findTwoFactorSettings(db, userID)
  if (!settings.backupCodes || settings.backupCodes.length === 0) {
    throw new Error('No backup codes available')
  }
  if (!settings.backupCodes.includes(code)) {
    throw new Error('Invalid backup code')
  }
  const newCodes = settings.backupCodes.filter(c => c !== code).join(',')
  return await db<User>(USERS_TABLE)
    .where({ id: userID })
    .update({
      twoFactorBackupCodes: await cloakValue(newCodes)
    })
}

// --

export const createInitialUsersTable = async (db: Knex) => {
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

    // Auth - 2FA
    table
      .boolean('twoFactorEnabled')
      .notNullable()
      .defaultTo(false)
    table
      .boolean('twoFactorVerified')
      .notNullable()
      .defaultTo(false)
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
