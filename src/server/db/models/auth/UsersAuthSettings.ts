import Knex from 'knex'
import { USERS_AUTH_SRP_TABLE } from './UsersAuthSRP'
import { updatedAtFieldAutoUpdate } from '~/src/server/db/utility'
import { cloakValue, decloakValue } from '../../encryption'

export const USERS_AUTH_SETTINGS_TABLE = 'users_auth_settings'

export interface UserAuthSettings {
  userID: string
  twoFactorEnabled: boolean
  twoFactorVerified: boolean
  twoFactorSecret?: string
  twoFactorBackupCodes?: string // comma-separated array
}

export interface TwoFactorSettings {
  enabled: boolean
  verified: boolean
  secret?: string
  backupCodes?: string[]
}

// --

const cloak = async (entity: UserAuthSettings): Promise<UserAuthSettings> => {
  return {
    ...entity,
    twoFactorSecret:
      entity.twoFactorSecret && (await cloakValue(entity.twoFactorSecret)),
    twoFactorBackupCodes:
      entity.twoFactorBackupCodes &&
      (await cloakValue(entity.twoFactorBackupCodes))
  }
}

const decloak = async (entity: UserAuthSettings): Promise<UserAuthSettings> => {
  return {
    ...entity,
    twoFactorSecret:
      entity.twoFactorSecret && (await decloakValue(entity.twoFactorSecret)),
    twoFactorBackupCodes:
      entity.twoFactorBackupCodes &&
      (await decloakValue(entity.twoFactorBackupCodes))
  }
}

// --

export const createUserAuthSettings = async (db: Knex, userID: string) => {
  const settings: UserAuthSettings = await cloak({
    userID,
    twoFactorEnabled: false,
    twoFactorVerified: false
  })
  return await db.insert(settings).into(USERS_AUTH_SETTINGS_TABLE)
}

// --

export const findTwoFactorSettings = async (
  db: Knex,
  userID: string
): Promise<TwoFactorSettings> => {
  const result = await db
    .select<UserAuthSettings[]>('*')
    .from(USERS_AUTH_SETTINGS_TABLE)
    .where({ userID })
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
  return await db<UserAuthSettings>(USERS_AUTH_SETTINGS_TABLE)
    .where({ userID })
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
  return await db<UserAuthSettings>(USERS_AUTH_SETTINGS_TABLE)
    .where({
      userID,
      twoFactorEnabled: true
    })
    .update({
      twoFactorVerified: true,
      twoFactorBackupCodes: await cloakValue(backupCodes.join(','))
    })
}

export const cancelTwoFactor = async (db: Knex, userID: string) => {
  return await db<UserAuthSettings>(USERS_AUTH_SETTINGS_TABLE)
    .where({
      userID
    })
    .update({
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      twoFactorEnabled: false,
      twoFactorVerified: false
    })
}

export const disableTwoFactor = async (db: Knex, userID: string) => {
  return await db<UserAuthSettings>(USERS_AUTH_SETTINGS_TABLE)
    .where({
      userID,
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
  return await db<UserAuthSettings>(USERS_AUTH_SETTINGS_TABLE)
    .where({ userID })
    .update({
      twoFactorBackupCodes: await cloakValue(newCodes)
    })
}

// --

export const createInitialUsersAuthSettingsTable = async (db: Knex) => {
  await db.schema.createTable(USERS_AUTH_SETTINGS_TABLE, table => {
    table.timestamps(true, true)
    table
      .string('userID')
      .notNullable()
      .primary()
    table.foreign('userID').references(`${USERS_AUTH_SRP_TABLE}.id`)

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
  await updatedAtFieldAutoUpdate(db, USERS_AUTH_SETTINGS_TABLE)
}
