import nacl from 'tweetnacl'
import {
  generateKey,
  encryptString,
  decryptString,
  CloakKey,
  CloakedString
} from './crypto/cloak'
import { b64, encoders, decoders, Encoding } from './crypto/primitives/codec'

/**
 * The Keychain holds all the keys to an account.
 *
 * Some application-specific things are locked in Vaults,
 * which are also encrypted and their keys are stored in the
 * Keychain.
 *
 * The keychain is stored encrypted on the server, it is locked
 * and unlocked with a keychain key derived from the users login
 * credentials (username:password) and a salt created on signup.
 */
export interface Keychain {
  /**
   * Version identifier
   *
   * It is used to help migrations in the keychain data format.
   */
  v: number

  // Personal keys --

  /**
   * Ed25519 key pair for signing messages.
   *
   * The public key will be sent in clear text to the server
   * for peer distribution.
   */
  signatureKeyPair: nacl.SignKeyPair

  /**
   * Vault keys are the main applicative payload of a keychain.
   *
   * @see VaultKey for more documentation.
   */
  vaultKeys: VaultKey[]

  // Sharing --

  /**
   * X25519 key pair to establish shared TweetNaCl Box symmetric keys
   * with other users of the platform.
   *
   * The public key will be sent in clear text to the server
   * for peer distribution.
   */
  sharingKeyPair: nacl.BoxKeyPair

  /**
   * A list of agreed keys shared with other users of the platform.
   *
   * @see SharedKey for more documentation
   */
  sharedKeys: SharedKey[]
}

// -----------------------------------------------------------------------------

export interface VaultKey {
  vaultID: string
  name: string
  key: CloakKey
}

export interface SharedKey {
  userID: string
  boxKey: Uint8Array
  signaturePublicKey: Uint8Array
}

// -----------------------------------------------------------------------------

export const createKeychain = (): Keychain => {
  return {
    v: 1,
    signatureKeyPair: nacl.sign.keyPair(),
    vaultKeys: [],
    sharingKeyPair: nacl.box.keyPair(),
    sharedKeys: []
  }
}

export const getKeychainPublicKeys = (keychain: Keychain) => {
  return {
    signaturePublicKey: b64.encode(keychain.signatureKeyPair.publicKey),
    sharingPublicKey: b64.encode(keychain.sharingKeyPair.publicKey)
  }
}

// -----------------------------------------------------------------------------

export const createKeychainKey = async () => {
  return await generateKey()
}

// -----------------------------------------------------------------------------

interface SerializableSharedKey extends Pick<SharedKey, 'userID'> {
  boxKey: string
  signaturePublicKey: string
}

interface SerializableKeychain
  extends Omit<Keychain, 'signatureKeyPair' | 'sharingKeyPair' | 'sharedKeys'> {
  signatureKeyPair: string // Only the secret key is kept and base64 encoded
  sharingKeyPair: string // Only the secret key is kept and base64 encoded
  sharedKeys: SerializableSharedKey[]
}

export const lockKeychain = async (
  keychain: Keychain,
  key: CloakKey
): Promise<CloakedString> => {
  const json: SerializableKeychain = {
    ...keychain,
    signatureKeyPair: b64.encode(keychain.signatureKeyPair.secretKey),
    sharingKeyPair: b64.encode(keychain.sharingKeyPair.secretKey),
    sharedKeys: keychain.sharedKeys.map(sk => ({
      ...sk,
      boxKey: b64.encode(sk.boxKey),
      signaturePublicKey: b64.encode(sk.signaturePublicKey)
    }))
  }
  return await encryptString(JSON.stringify(json), key)
}

export const unlockKeychain = async (
  keychain: CloakedString,
  key: CloakKey
): Promise<Keychain> => {
  const json = await decryptString(keychain, key)
  const parsed: SerializableKeychain = JSON.parse(json)
  return {
    ...parsed,
    signatureKeyPair: nacl.sign.keyPair.fromSecretKey(
      b64.decode(parsed.signatureKeyPair)
    ),
    sharingKeyPair: nacl.box.keyPair.fromSecretKey(
      b64.decode(parsed.sharingKeyPair)
    ),
    sharedKeys: parsed.sharedKeys.map(sk => ({
      ...sk,
      boxKey: b64.decode(sk.boxKey),
      signaturePublicKey: b64.decode(sk.signaturePublicKey)
    }))
  }
}

// --

export const addVaultKey = (
  keychain: Keychain,
  vaultID: string,
  name: string,
  vaultKey: CloakKey
): Keychain => {
  keychain.vaultKeys.push({
    vaultID,
    name,
    key: vaultKey
  })
  return keychain
}

export const getVaultKeyByID = (keychain: Keychain, vaultID: string) => {
  return keychain.vaultKeys.find(k => k.vaultID === vaultID)
}

export const getVaultKeyByName = (keychain: Keychain, name: string) => {
  return keychain.vaultKeys.find(k => k.name === name)
}

// --

export const signMessage = (
  message: string,
  keychain: Keychain,
  userID: string,
  encoding: Encoding = 'utf8'
) => {
  const decode = decoders[encoding]
  const signature = nacl.sign(
    decode(message),
    keychain.signatureKeyPair.secretKey
  )
  return [
    'v1',
    'naclsign',
    userID.split('-')[0],
    encoding,
    b64.encode(signature)
  ].join('.')
}

export const verifyMessageSignature = (input: string, keychain: Keychain) => {
  if (!input.startsWith('v1.')) {
    throw new Error('Unknown format')
  }
  const [_, algo, userID, encoding, signature] = input.split('.')
  if (algo !== 'naclsign') {
    throw new Error('Unsupported signature scheme')
  }
  const encode = encoders[encoding as Encoding]
  if (!encode) {
    throw new Error('Unsupported message encoding')
  }
  const candidates = keychain.sharedKeys.filter(sharedKey =>
    sharedKey.userID.startsWith(userID)
  )
  if (candidates.length === 0) {
    throw new Error(`No known public key for user ${userID}`)
  }
  for (const candidate of candidates) {
    const message = nacl.sign.open(
      b64.decode(signature),
      candidate.signaturePublicKey
    )
    if (!message) {
      continue
    }
    return encode(message)
  }
  throw new Error('Invalid signature')
}
