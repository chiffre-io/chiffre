import nacl, { BoxKeyPair } from 'tweetnacl'
import { utf8 } from './codec'
import { Cipher } from './crypto'

export interface Vault {
  createdAt: Date
}

export interface OrganizationKeychain {
  /**
   * ID of the organization
   */
  id: string

  /**
   * Key to unlock the organization vault,
   * shared across members.
   */
  key: Uint8Array

  /**
   * Public & secret keys used by the member
   * to discuss with others.
   * Generated when the member joins the org.
   */
  memberKeyPair: BoxKeyPair
}

/**
 * A repository of keys used to unlock vaults.
 * Each user gets their own personal vault,
 * but when they joint organizations they get
 * access to shared keys for the org vaults.
 */
export interface UserKeychain {
  ownVaultKey: Uint8Array
  orgVaultKeys: OrganizationKeychain[]
}

export const createAccount = (): UserKeychain => {
  return {
    ownVaultKey: nacl.box.keyPair().secretKey,
    orgVaultKeys: []
  }
}

export const createVault = ({ now = new Date() } = {}): Vault => {
  return {
    createdAt: now
  }
}

// --

export const serializeVault = (vault: Vault): string => JSON.stringify(vault)
export const deserializeVault = (vault: string): Vault =>
  JSON.parse(vault, (key, value) => {
    if (key === 'createdAt') {
      return new Date(value)
    }
    return value
  })

// --

export const lockOwnVault = (vault: Vault, account: UserKeychain): Cipher => {
  const txtVault = serializeVault(vault)
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
  const cipherText = nacl.secretbox(
    utf8.encode(txtVault),
    nonce,
    account.ownVaultKey
  )
  return {
    text: cipherText,
    nonce
  }
}

export const unlockOwnVault = (
  cipher: Cipher,
  account: UserKeychain
): Vault | null => {
  const vaultBuffer = nacl.secretbox.open(
    cipher.text,
    cipher.nonce,
    account.ownVaultKey
  )
  if (!vaultBuffer) {
    return null
  }
  const vaultJson = utf8.decode(vaultBuffer)
  return deserializeVault(vaultJson)
}
