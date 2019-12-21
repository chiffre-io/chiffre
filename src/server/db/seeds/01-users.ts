import Knex from 'knex'
import dotenv from 'dotenv'
import { cloak as cloakUser, User, USERS_TABLE } from '../models/auth/Users'
import { createKeychainRecord } from '../models/entities/Keychains'
import { createSignupEntities } from '~/src/client/engine/account'

export const testUserCredentials = {
  username: 'admin@example.com',
  password: 'password',
  userID: '___testUserId___'
}

export const seed = async (knex: Knex) => {
  dotenv.config()
  if (process.env.NODE_ENV === 'production') {
    return
  }
  try {
    const { username, password, userID } = testUserCredentials
    const params = await createSignupEntities(username, password)
    const user: User = {
      id: userID,
      ...(await cloakUser({
        username,
        srpSalt: params.srpSalt,
        srpVerifier: params.srpVerifier,
        masterSalt: params.masterSalt,
        twoFactorEnabled: false,
        twoFactorVerified: false
      }))
    }
    await knex.insert(user).into(USERS_TABLE)
    await createKeychainRecord(knex, { userID, ...params.keychain })
  } catch (error) {
    console.error(error)
  }
}
