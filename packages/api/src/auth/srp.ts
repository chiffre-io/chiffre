import srpServer from 'secure-remote-password/server'
import { base64ToHex, hexToBase64url } from '@47ng/codec'

/**
 *
 * @param verifier base64url-encoded
 * @returns The ephemeral public/secret key pair, both base64url-encoded.
 */
export function serverLoginChallenge(verifier: string): srpServer.Ephemeral {
  const verifierHex = base64ToHex(verifier)
  const ephemeral = srpServer.generateEphemeral(verifierHex)
  return {
    public: hexToBase64url(ephemeral.public),
    secret: hexToBase64url(ephemeral.secret)
  }
}

export function serverLoginResponse(
  serverSecretEphemeral: string,
  clientPublicEphemeral: string,
  salt: string,
  username: string,
  verifier: string,
  clientProof: string
): srpServer.Session {
  const session = srpServer.deriveSession(
    base64ToHex(serverSecretEphemeral),
    base64ToHex(clientPublicEphemeral),
    base64ToHex(salt),
    username,
    base64ToHex(verifier),
    base64ToHex(clientProof)
  )
  return {
    key: hexToBase64url(session.key),
    proof: hexToBase64url(session.proof)
  }
}
