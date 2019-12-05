import Knex from 'knex'
import { createUser } from '../models/auth/UsersAuthSRP'
import { createUserAuthSettings } from '../models/auth/UsersAuthSettings'
import { createKeychainRecord } from '../models/auth/Keychains'
import { createSignupEntities } from '~/src/client/engine/account'

export const seed = async (knex: Knex) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }
  try {
    const username = 'admin@example.com'
    const password = 'password'
    const params = await createSignupEntities(username, password)
    const userID = await createUser(
      knex,
      username,
      params.srpSalt,
      params.srpVerifier,
      params.masterSalt
    )
    await createUserAuthSettings(knex, userID)
    await createKeychainRecord(knex, { userID, ...params.keychain })
  } catch (error) {
    console.error(error)
    // Maybe it already exists
  }
}
