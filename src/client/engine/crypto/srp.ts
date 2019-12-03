import { SignupParameters } from '~/pages/api/auth/signup'
import srpClient from 'secure-remote-password/client'
import { pbkdf2DeriveBytes } from './primitives/pbkdf2'
import { hex, b64, hexToBase64url, base64ToHex, utf8 } from './primitives/codec'

const derivePrivateKey = async (
  username: string,
  password: string,
  salt: string
) => {
  const bytes = await pbkdf2DeriveBytes(
    b64.encode(utf8.encode([username, password].join(':'))),
    hex.decode(salt),
    32, // 32 bytes key (256 bits)
    'SHA-256',
    20000
  )
  return hex.encode(bytes)
}

// --

type SrpSignupParameters = Pick<
  SignupParameters,
  'username' | 'salt' | 'verifier'
>

export const clientSignup = async (
  username: string,
  password: string
): Promise<SrpSignupParameters> => {
  const salt = srpClient.generateSalt()

  const privateKey = await derivePrivateKey(username, password, salt)
  const verifier = srpClient.deriveVerifier(privateKey)

  return {
    username,
    salt: hexToBase64url(salt),
    verifier: hexToBase64url(verifier)
  }
}

// --

interface ClientLoginResponse {
  ephemeral: srpClient.Ephemeral // base64url-encoded fields
  session: srpClient.Session // base64url-encoded fields
}

/**
 *
 * @param username User-provided username
 * @param password User-provided password
 * @param salt Salt retrieved by the server, base64url-encoded
 * @param serverEphemeral The server's public ephemeral, base64url-encoded
 */
export const clientAssembleLoginResponse = async (
  username: string,
  password: string,
  salt: string,
  serverEphemeral: string
): Promise<ClientLoginResponse> => {
  const saltHex = base64ToHex(salt)
  const clientEphemeral = srpClient.generateEphemeral()
  const privateKey = await derivePrivateKey(username, password, saltHex)

  const session = srpClient.deriveSession(
    clientEphemeral.secret,
    base64ToHex(serverEphemeral),
    saltHex,
    username,
    privateKey
  )

  // All I/Os are base64url-encoded
  return {
    ephemeral: {
      public: hexToBase64url(clientEphemeral.public),
      secret: hexToBase64url(clientEphemeral.secret)
    },
    session: {
      key: hexToBase64url(session.key),
      proof: hexToBase64url(session.proof)
    }
  }
}

// --

export const clientVerifyLogin = async (
  serverProof: string,
  clientEphemeral: srpClient.Ephemeral,
  session: srpClient.Session
) => {
  // Will throw if proofs don't match
  srpClient.verifySession(
    base64ToHex(clientEphemeral.public),
    {
      key: base64ToHex(session.key),
      proof: base64ToHex(session.proof)
    },
    base64ToHex(serverProof)
  )
}
