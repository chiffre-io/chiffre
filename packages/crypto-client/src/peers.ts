import nacl from 'tweetnacl'
import { UnlockedKeychain } from './keychain'
import { b64, utf8 } from '@47ng/codec'

/**
 * Public keys representing a peer in the network
 *
 * Those keys are base64url encoded, as found in a locked keychain.
 */
export interface Peer {
  username?: string
  signature: string
  sharing: string
}

export function keychainToPeer(keychain: UnlockedKeychain): Peer {
  return {
    signature: b64.encode(keychain.signature.publicKey),
    sharing: b64.encode(keychain.sharing.publicKey)
  }
}

/**
 * Peer messages are encrypted and signed.
 *
 * TweetNaCl is used for encryption and signature.
 * We sign the nonce that was used for encryption,
 * for multiple reasons:
 * - It is constant-length (as opposed to the message)
 * - It's not supposed to be a secret and has to be
 *   transmitted anyway, so it saves bandwidth.
 * - It forces verification of the signature upon
 *   reception of a message prior to decryption.
 * - It is outside of an attacker's control
 *
 * @param message - An UTF-8 encoded string to send
 * @param peer - Who to send the message to (public keys)
 * @param keychain - The sender's unlocked keychain
 */
export function packMessage(
  message: string,
  peer: Peer,
  keychain: UnlockedKeychain
) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const sig = nacl.sign(nonce, keychain.signature.secretKey)
  const cipher = nacl.box(
    utf8.encode(message),
    nonce,
    b64.decode(peer.sharing),
    keychain.sharing.secretKey
  )
  return JSON.stringify({
    v: 1,
    sig: b64.encode(sig),
    msg: b64.encode(cipher)
  })
}

/**
 * Parse, verify and decrypt a received message.
 *
 * Will throw if anything goes wrong, can be (non-exhaustive):
 * - JSON parsing errors
 * - Unsupported format
 * - Invalid signature
 * - Failure to decrypt
 * - Failure to encode resulting message to UTF-8
 *
 * @param message - The received message
 * @param peer - Who sent the message (public keys)
 * @param keychain - The receiver's unlocked keychain
 */
export function unpackMessage(
  message: string,
  peer: Peer,
  keychain: UnlockedKeychain
) {
  const json = JSON.parse(message)
  if (json.v !== 1) {
    throw new Error('Unsupported format')
  }
  const nonce = nacl.sign.open(b64.decode(json.sig), b64.decode(peer.signature))
  if (!nonce) {
    throw new Error('Invalid signature')
  }
  const msg = nacl.box.open(
    b64.decode(json.msg),
    nonce,
    b64.decode(peer.sharing),
    keychain.sharing.secretKey
  )
  return utf8.decode(msg)
}
