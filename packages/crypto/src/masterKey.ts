import { encryptString, decryptString, CloakKey } from '@47ng/cloak'
import { b64 } from './primitives/codec'
import { hashString } from './primitives/hash'
import { generateSalt, pbkdf2DeriveBytes } from './primitives/pbkdf2'
import { splitSecret, assembleSecret } from './tss'
import { formatKey } from '@47ng/cloak/dist/key'

export type MasterKey = CloakKey

export interface CreateMasterKeyOutput {
  masterKey: MasterKey
  masterSalt: string
  shards: string[]
}

export async function createMasterKey(
  username: string,
  password: string
): Promise<CreateMasterKeyOutput> {
  const masterSalt = b64.encode(generateSalt())
  const masterKey = await deriveMasterKey(username, password, masterSalt)
  const shards = splitSecret(masterKey, 2, 2, 'utf8')
  return { masterKey, masterSalt, shards }
}

export async function deriveMasterKey(
  username: string,
  password: string,
  salt: string
): Promise<MasterKey> {
  const key = await pbkdf2DeriveBytes(
    [password, username].join(':'),
    b64.decode(salt),
    32,
    'SHA-256',
    100000
  )
  return formatKey(key)
}

// --

/**
 * Recompose a Master Key from two shards using Shamir's secret sharing.
 *
 * This would be used if a user forgot their password.
 * One half of the Master key would be stored in our servers,
 * and the other half kept by the user. Considering shards are impossible
 * to remember, users would have to store it somewhere. Assuming they still
 * have access to the shard presented to them upon signup, they can initiate
 * a password reset flow, where the server would send them their half of the
 * Master key, so they can recompose it to gain access to their data (and
 * reset their password).
 *
 * @param shards The two parts generated when creating the master key
 */
export function recomposeMasterKeyFromShards(shards: string[]) {
  try {
    return assembleSecret(shards, 'utf8')
  } catch {
    return null
  }
}

// --

export async function createMasterKeyFromToken(token: string) {
  const username = await hashString(token, 'utf8', 'hex')
  return await createMasterKey(username, token)
}

export async function deriveMasterKeyFromToken(token: string, salt: string) {
  const username = await hashString(token, 'utf8', 'hex')
  return await deriveMasterKey(username, token, salt)
}

// --

export async function encryptKeychainKey(
  keychainKey: CloakKey,
  masterKey: MasterKey
) {
  return await encryptString(keychainKey, masterKey)
}

export async function decryptKeychainKey(
  keychainKey: string,
  masterKey: MasterKey
) {
  return await decryptString(keychainKey, masterKey)
}
