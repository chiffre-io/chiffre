import Knex from 'knex'
import dotenv from 'dotenv'
import { cloak as cloakUser, User, USERS_TABLE } from '../models/auth/Users'
import { createKeychainRecord } from '../models/entities/Keychains'
import { TwoFactorStatus } from '../../auth/types'
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
          '7240afa8-3215a4e6-cd78cb3b-0563147b',
          '523bab2b-8c608131-9c427d2e-74a7b519',
          '242bc2a7-da454383-2204945c-d9cf1bac',
          '5cbf429a-4afddc8f-61559fbb-11873181',
          '29bc2ce3-b2656f6b-5f89a8a4-e35add7e',
          'dec705ef-8e380128-40d86f68-20bec3ff',
          'e6f68e4b-2c83e14f-ef74249b-6b83000d',
          'c298f7de-acc703ab-6497911c-1a611bae'
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
