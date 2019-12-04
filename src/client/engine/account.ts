import { SignupParameters } from '~/pages/api/auth/signup'
import { clientSignup } from './crypto/srp'
import {
  createKeychain,
  createKeychainKey,
  lockKeychain,
  getKeychainPublicKeys,
  unlockKeychain,
  Keychain,
  addVaultKey,
  getVaultKeyByName
} from './keychain'
import {
  createMasterKey,
  encryptKeychainKey,
  deriveMasterKey
} from './masterKey'
import { decryptString, generateKey } from './crypto/cloak'
import { clientApi } from '~/src/client/api'
import { KeychainRecord } from '~/src/server/db/models/auth/Keychains'
import { createVault, lockVault } from './vault'
import { CreateVaultArgs, CreateVaultResponse } from '~/pages/api/vaults'

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

export const unlockEntities = async (
  username: string,
  password: string,
  masterSalt: string
) => {
  const masterKey = await deriveMasterKey(username, password, masterSalt)
  const {
    encrypted: encryptedKeychain,
    key: encryptedKeychainKey
  } = await clientApi.get<KeychainRecord>('/keychain')
  const keychainKey = await decryptString(encryptedKeychainKey, masterKey)
  const keychain = await unlockKeychain(encryptedKeychain, keychainKey)

  await createUserVaultIfNeeded(username, keychain)
  return { keychainKey, keychain }
}

export const createUserVaultIfNeeded = async (
  username: string,
  keychain: Keychain
) => {
  if (getVaultKeyByName(keychain, username)) {
    return
  }
  const vault = createVault(username)
  const vaultKey = await generateKey()
  const lockedVault = await lockVault(vault, vaultKey)

  // Send new vault to the server
  const { vaultID } = await clientApi.post<
    CreateVaultArgs,
    CreateVaultResponse
  >('/vaults', {
    encrypted: lockedVault
  })

  // Store vault key in the keychain
  return addVaultKey(keychain, vaultID, username, vaultKey)
}
