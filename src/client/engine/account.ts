import nacl from 'tweetnacl'
import { SignupParameters } from '~/pages/api/auth/signup'
import { generateSrpSignupEntities } from './crypto/srp'
import {
  createMasterKey,
  encryptKeychainKey,
  deriveMasterKey
} from './masterKey'
import { generateKey, decryptString, encryptString } from '@47ng/cloak'
import api from '~/src/client/api'
import { KeychainRecord } from '~/src/server/db/models/entities/Keychains'
import { b64 } from '~/src/client/engine/crypto/primitives/codec'

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

  // Signature & sharing
  const signatureKeyPair = nacl.sign.keyPair()
  const sharingKeyPair = nacl.box.keyPair()

  // Assemble keychain
  const keychain: Omit<KeychainRecord, 'userID'> = {
    key: encryptedKeychainKey,
    signaturePublicKey: b64.encode(signatureKeyPair.publicKey),
    signatureSecretKey: await encryptString(
      b64.encode(signatureKeyPair.secretKey),
      keychainKey
    ),
    sharingPublicKey: b64.encode(sharingKeyPair.publicKey),
    sharingSecretKey: await encryptString(
      b64.encode(signatureKeyPair.secretKey),
      keychainKey
    )
  }

  // Pack everything for signup
  return {
    ...srpEntities,
    masterSalt,
    keychain
  }
}

export const unlockKeychain = async (
  username: string,
  password: string,
  masterSalt: string
) => {
  const masterKey = await deriveMasterKey(username, password, masterSalt)
  const {
    key: encryptedKeychainKey,
    signatureSecretKey,
    sharingSecretKey
  } = await api.get<KeychainRecord>('/keychain')
  const keychainKey = await decryptString(encryptedKeychainKey, masterKey)
  return {
    keychainKey,
    signatureSecretKey: await decryptString(signatureSecretKey, keychainKey),
    sharingSecretKey: await decryptString(sharingSecretKey, keychainKey)
  }
}
