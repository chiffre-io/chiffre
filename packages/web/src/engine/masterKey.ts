import { encryptString, decryptString, CloakKey, exportKey } from '@47ng/cloak'
// import { b64 } from './crypto/primitives/codec'
// import { hashString } from './crypto/primitives/hash'
// import {
//   generateSalt,
//   deriveAesGcmKeyFromPassword
// } from './crypto/primitives/pbkdf2'

// export const createMasterKey = async (username: string, password: string) => {
//   const masterSalt = b64.encode(generateSalt())
//   const masterKey = await deriveMasterKey(username, password, masterSalt)
//   return { masterKey, masterSalt }
// }

// export const deriveMasterKey = async (
//   username: string,
//   password: string,
//   salt: string
// ): Promise<CloakKey> => {
//   const key = await deriveAesGcmKeyFromPassword(
//     [password, username].join('#'),
//     b64.decode(salt),
//     100000
//   )
//   return await exportKey(key)
// }

// // --

// export const createMasterKeyFromToken = async (token: string) => {
//   const username = await hashString(token, 'utf8', 'hex')
//   return await createMasterKey(username, token)
// }

// export const deriveMasterKeyFromToken = async (token: string, salt: string) => {
//   const username = await hashString(token, 'utf8', 'hex')
//   return await deriveMasterKey(username, token, salt)
// }

// // --

// export const encryptKeychainKey = async (
//   keychainKey: CloakKey,
//   masterKey: CloakKey
// ) => {
//   return await encryptString(keychainKey, masterKey)
// }

// export const decryptKeychainKey = async (
//   keychainKey: string,
//   masterKey: CloakKey
// ) => {
//   return await decryptString(keychainKey, masterKey)
// }
