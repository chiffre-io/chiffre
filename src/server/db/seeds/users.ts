import Knex from 'knex'
import { createUser } from '../models/auth/UsersAuthSRP'
import { createUserAuthSettings } from '../models/auth/UsersAuthSettings'
import { clientSignup } from '../../../client/engine/crypto/srp'
import { createKeychainRecord, KeychainRecord } from '../models/auth/Keychains'
import {
  createKeychain as createClientKeychain,
  createKeychainKey,
  lockKeychain,
  getKeychainPublicKeys
} from '../../../client/engine/keychain'

export const seed = async (knex: Knex) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  const password = 'password'
  const { username, salt, verifier } = await clientSignup(
    'admin@example.com',
    password
  )
  try {
    const userID = await createUser(knex, username, salt, verifier)
    await createUserAuthSettings(knex, userID)
    const keychain = createClientKeychain()
    const { key, salt: keychainSalt } = await createKeychainKey(
      username,
      password
    )
    const lockedKeychain = await lockKeychain(keychain, key)
    const keychainRecord: KeychainRecord = {
      userID,
      salt: keychainSalt,
      encrypted: lockedKeychain,
      ...getKeychainPublicKeys(keychain)
    }
    await createKeychainRecord(knex, keychainRecord)
  } catch (error) {
    console.error(error)
    // Maybe it already exists
  }
}
