import { SignupParameters } from '~/pages/api/auth/signup'
import { clientSignup } from './crypto/srp'
import {
  createKeychain,
  createKeychainKey,
  lockKeychain,
  getKeychainPublicKeys
} from './keychain'
import { createMasterKey, encryptKeychainKey } from './masterKey'

export const createSignupEntities = async (
  username: string,
  password: string
): Promise<SignupParameters> => {
  // Generate SRP entities
  const srpParams = await clientSignup(username, password)

  // Derive the master key from username:password
  const { masterKey, masterSalt } = await createMasterKey(username, password)

  // Create keychain and its key
  const keychain = createKeychain()
  const keychainKey = await createKeychainKey()

  // Lock the keychain and encrypt its key
  const lockedKeychain = await lockKeychain(keychain, keychainKey)
  const encryptedKeychainKey = await encryptKeychainKey(keychainKey, masterKey)

  // Pack everything for signup
  return {
    ...srpParams,
    masterSalt,
    keychain: {
      encrypted: lockedKeychain,
      key: encryptedKeychainKey,
      ...getKeychainPublicKeys(keychain)
    }
  }
}

export const createUserVault = () => {}
