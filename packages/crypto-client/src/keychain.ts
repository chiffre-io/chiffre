import nacl from 'tweetnacl'
import { CloakKey, encryptString, decryptString } from '@47ng/cloak'
import { b64 } from '@47ng/codec'

export interface Keychain {
  signature: {
    secret: string // base64url, encrypted with the keychain key
    public: string // base64url
  }
  sharing: {
    secret: string
    public: string
  }
}

export interface UnlockedKeychain {
  signature: nacl.SignKeyPair
  sharing: nacl.BoxKeyPair
}

// --

export function createKeychain(): UnlockedKeychain {
  return {
    signature: nacl.sign.keyPair(),
    sharing: nacl.box.keyPair()
  }
}

// --

export async function lockKeychain(
  input: UnlockedKeychain,
  keychainKey: CloakKey
): Promise<Keychain> {
  return {
    signature: {
      secret: await encryptString(
        b64.encode(input.signature.secretKey),
        keychainKey
      ),
      public: b64.encode(input.signature.publicKey)
    },
    sharing: {
      secret: await encryptString(
        b64.encode(input.sharing.secretKey),
        keychainKey
      ),
      public: b64.encode(input.sharing.publicKey)
    }
  }
}

// --

export async function unlockKeychain(
  input: Keychain,
  keychainKey: CloakKey
): Promise<UnlockedKeychain> {
  const signatureSecret = await decryptString(
    input.signature.secret,
    keychainKey
  )
  const sharingSecret = await decryptString(input.sharing.secret, keychainKey)

  return {
    signature: nacl.sign.keyPair.fromSecretKey(b64.decode(signatureSecret)),
    sharing: nacl.box.keyPair.fromSecretKey(b64.decode(sharingSecret))
  }
}
