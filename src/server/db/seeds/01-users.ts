import Knex from 'knex'
import { UserAuthSrp, USERS_AUTH_SRP_TABLE } from '../models/auth/UsersAuthSRP'
import { createUserAuthSettings } from '../models/auth/UsersAuthSettings'
import { createKeychainRecord } from '../models/auth/Keychains'
import { createSignupEntities } from '~/src/client/engine/account'

export const testUserCredentials = {
  username: 'admin@example.com',
  password: 'password',
  userID: 'facade47-dead-f00d-baad-cafebaadcafe'
}

export const seed = async (knex: Knex) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }
  try {
    const { username, password, userID } = testUserCredentials
    const params = await createSignupEntities(username, password)
    const srpUser: UserAuthSrp = {
      id: userID,
      username,
      srpSalt: params.srpSalt,
      srpVerifier: params.srpVerifier,
      masterSalt: params.masterSalt
    }
    await knex.insert(srpUser).into(USERS_AUTH_SRP_TABLE)
    await createUserAuthSettings(knex, userID)
    await createKeychainRecord(knex, { userID, ...params.keychain })
  } catch (error) {
    //console.error(error)
  }
}
