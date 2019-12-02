import Knex from 'knex'
import { USERS_AUTH_SRP_TABLE } from './UsersAuthSRP'

export const USERS_AUTH_SETTINGS_TABLE = 'users_auth_settings'

export interface UserAuthSettings {
  userID: string
  twoFactorEnabled: boolean
  twoFactorVerified: boolean
  twoFactorSecret?: string
}

export type TwoFactorSettings = Pick<
  UserAuthSettings,
  'twoFactorEnabled' | 'twoFactorVerified' | 'twoFactorSecret'
>

// --

export const createUserAuthSettings = async (db: Knex, userID: string) => {
  const settings: UserAuthSettings = {
    userID,
    twoFactorEnabled: false,
    twoFactorVerified: false
  }
  return await db.insert(settings).into(USERS_AUTH_SETTINGS_TABLE)
}

// --

export const getTwoFactorSettings = async (
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
  const { twoFactorEnabled, twoFactorSecret, twoFactorVerified } = result[0]
  return {
    twoFactorEnabled,
    twoFactorSecret,
    twoFactorVerified
  }
}

export const userRequiresTwoFactorAuth = async (db: Knex, userID: string) => {
  const settings = await getTwoFactorSettings(db, userID)
  if (!settings) {
    return null
  }
  return settings.twoFactorVerified
}

// --

export const enableTwoFactor = async (
  db: Knex,
  userID: string,
  secret: string
) => {
  return await db<UserAuthSettings>(USERS_AUTH_SETTINGS_TABLE)
    .where({
      userID
      // twoFactorEnabled: false,
      // twoFactorSecret: null // Don't allow mutating the secret
    })
    .update({
      twoFactorEnabled: true,
      twoFactorVerified: false,
      twoFactorSecret: secret
    })
}

export const markTwoFactorVerified = async (db: Knex, userID: string) => {
  return await db<UserAuthSettings>(USERS_AUTH_SETTINGS_TABLE)
    .where({
      userID,
      twoFactorEnabled: true
    })
    .update({
      twoFactorVerified: true
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
      twoFactorEnabled: false,
      twoFactorVerified: false
    })
}

// --

export const createInitialUsersAuthSettingsTable = async (db: Knex) => {
  await db.schema.createTable(USERS_AUTH_SETTINGS_TABLE, table => {
    table.timestamp('created_at').defaultTo(db.fn.now())

    table
      .uuid('userID')
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
      .string('twoFactorSecret')
      .nullable()
      .defaultTo(null)
  })
}
