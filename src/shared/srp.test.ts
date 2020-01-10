import {
  generateSrpSignupEntities,
  clientAssembleLoginResponse,
  clientVerifyLogin
} from '~/src/client/engine/crypto/srp'
import { serverLoginChallenge, serverLoginResponse } from '~/src/srp'

describe('SRP', () => {
  test('complete login flow', async () => {
    const username = 'username'
    const password = 'password'
    const { srpSalt, srpVerifier } = await generateSrpSignupEntities(
      username,
      password
    )
    const serverEphemeral = serverLoginChallenge(srpVerifier)
    const {
      session: clientSession,
      ephemeral: clientEphemeral
    } = await clientAssembleLoginResponse(
      username,
      password,
      srpSalt,
      serverEphemeral.public
    )
    const serverSession = serverLoginResponse(
      serverEphemeral.secret,
      clientEphemeral.public,
      srpSalt,
      username,
      srpVerifier,
      clientSession.proof
    )
    expect(serverSession.key).toEqual(clientSession.key)
    const verify = () =>
      clientVerifyLogin(serverSession.proof, clientEphemeral, clientSession)
    expect(verify).not.toThrow()
  })

  test('login with wrong password', async () => {
    const username = 'username'
    const { srpSalt, srpVerifier } = await generateSrpSignupEntities(
      username,
      'password-signup'
    )
    const serverEphemeral = serverLoginChallenge(srpVerifier)
    const {
      session: clientSession,
      ephemeral: clientEphemeral
    } = await clientAssembleLoginResponse(
      username,
      'password-login',
      srpSalt,
      serverEphemeral.public
    )
    const shouldThrow = () =>
      serverLoginResponse(
        serverEphemeral.secret,
        clientEphemeral.public,
        srpSalt,
        username,
        srpVerifier,
        clientSession.proof
      )
    expect(shouldThrow).toThrowError('Client provided session proof is invalid')
  })

  test('login with wrong username', async () => {
    const password = 'password'
    const { srpSalt, srpVerifier } = await generateSrpSignupEntities(
      'username-signup',
      password
    )
    const serverEphemeral = serverLoginChallenge(srpVerifier)
    const {
      session: clientSession,
      ephemeral: clientEphemeral
    } = await clientAssembleLoginResponse(
      'username-login',
      password,
      srpSalt,
      serverEphemeral.public
    )
    const shouldThrow = () =>
      serverLoginResponse(
        serverEphemeral.secret,
        clientEphemeral.public,
        srpSalt,
        'username-login',
        srpVerifier,
        clientSession.proof
      )
    expect(shouldThrow).toThrowError('Client provided session proof is invalid')
  })
})
