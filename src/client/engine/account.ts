import { SignupParameters } from '~/pages/api/auth/signup'
import { generateSrpSignupEntities } from './crypto/srp'
import {
  createMasterKey,
  encryptKeychainKey,
  deriveMasterKey
} from './masterKey'
import { generateKey, decryptString } from './crypto/cloak'
import { clientApi } from '~/src/client/api'
import { KeychainRecord } from '~/src/server/db/models/entities/Keychains'

export const createSignupEntities = async (
  username: string,
  password: string
): Promise<SignupParameters> => {
  // Generate SRP entities
  const srpEntities = await generateSrpSignupEntities(username, password)

  // Create a keychain key & encrypt it with the master key
  const { masterKey, masterSalt } = await createMasterKey(username, password)
  const keychainKey = await generateKey()
  const encryptedKeychainKey = await encryptKeychainKey(keychainKey, masterKey)

  // Pack everything for signup
  return {
    ...srpEntities,
    masterSalt,
    keychain: {
      key: encryptedKeychainKey
      // todo: Add sharing later
    }
  }
}

export const unlockKeychain = async (
  username: string,
  password: string,
  masterSalt: string
) => {
  const masterKey = await deriveMasterKey(username, password, masterSalt)
  const { key: encryptedKeychainKey } = await clientApi.get<KeychainRecord>(
    '/keychain'
  )
  const keychainKey = await decryptString(encryptedKeychainKey, masterKey)
  return keychainKey
}
