import Knex from 'knex'
import dotenv from 'dotenv'
import { cloak as cloakUser, User, USERS_TABLE } from '../models/auth/Users'
import { createKeychainRecord } from '../models/entities/Keychains'
import { TwoFactorStatus } from '../../exports/defs'
import {
  generateSrpSignupEntities,
  createMasterKey,
  createKeychain,
  lockKeychain
} from '@chiffre/crypto'
import { generateKey, encryptString } from '@47ng/cloak'

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
    const { username, userID, password } = testUserCredentials
    const { srpSalt, srpVerifier } = await generateSrpSignupEntities(
      username,
      password
    )
    const { masterKey, masterSalt } = await createMasterKey(username, password)
    const user: User = {
      id: userID,
      ...(await cloakUser({
        username,
        srpSalt,
        srpVerifier,
        masterSalt,
        twoFactorSecret: 'V2F3CZPN3JMZDA4S2DD3IXHYYTYB7Q3F',
        twoFactorBackupCodes: [
          '7240afa83215a4e6cd78cb3b0563147b',
          '523bab2b8c6081319c427d2e74a7b519',
          '242bc2a7da4543832204945cd9cf1bac',
          '5cbf429a4afddc8f61559fbb11873181',
          '29bc2ce3b2656f6b5f89a8a4e35add7e',
          'dec705ef8e38012840d86f6820bec3ff',
          'e6f68e4b2c83e14fef74249b6b83000d',
          'c298f7deacc703ab6497911c1a611bae'
        ].join(','),
        twoFactorStatus: TwoFactorStatus.verified
      }))
    }
    await knex.insert(user).into(USERS_TABLE)

    const keychain = createKeychain()
    const keychainKey = generateKey()
    const lockedKeychain = await lockKeychain(keychain, keychainKey)
    await createKeychainRecord(knex, {
      userID,
      key: await encryptString(keychainKey, masterKey),
      sharingPublicKey: lockedKeychain.sharing.public,
      sharingSecretKey: lockedKeychain.sharing.secret,
      signaturePublicKey: lockedKeychain.signature.public,
      signatureSecretKey: lockedKeychain.signature.secret
    })
  } catch (error) {
    console.error(error)
  }
}
