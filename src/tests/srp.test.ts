import {
  clientSignup,
  clientAssembleLoginResponse,
  clientVerifyLogin
} from '../client/engine/crypto/srp'
import { serverLoginChallenge, serverLoginResponse } from '../server/srp'

describe('SRP', () => {
  test('complete login flow', async () => {
    const username = 'username'
    const password = 'password'
    const { salt, verifier } = await clientSignup(username, password)
    const serverEphemeral = serverLoginChallenge(verifier)
    const {
      session: clientSession,
      ephemeral: clientEphemeral
    } = await clientAssembleLoginResponse(
      username,
      password,
      salt,
      serverEphemeral.public
    )
    const serverSession = serverLoginResponse(
      serverEphemeral.secret,
      clientEphemeral.public,
      salt,
      username,
      verifier,
      clientSession.proof
    )
    expect(serverSession.key).toEqual(clientSession.key)
    const verify = () =>
      clientVerifyLogin(serverSession.proof, clientEphemeral, clientSession)
    expect(verify).not.toThrow()
  })

  test('login with wrong password', async () => {
    const username = 'username'
    const { salt, verifier } = await clientSignup(username, 'password-signup')
    const serverEphemeral = serverLoginChallenge(verifier)
    const {
      session: clientSession,
      ephemeral: clientEphemeral
    } = await clientAssembleLoginResponse(
      username,
      'password-login',
      salt,
      serverEphemeral.public
    )
    const shouldThrow = () =>
      serverLoginResponse(
        serverEphemeral.secret,
        clientEphemeral.public,
        salt,
        username,
        verifier,
        clientSession.proof
      )
    expect(shouldThrow).toThrowError('Client provided session proof is invalid')
  })

  test('login with wrong username', async () => {
    const password = 'password'
    const { salt, verifier } = await clientSignup('username-signup', password)
    const serverEphemeral = serverLoginChallenge(verifier)
    const {
      session: clientSession,
      ephemeral: clientEphemeral
    } = await clientAssembleLoginResponse(
      'username-login',
      password,
      salt,
      serverEphemeral.public
    )
    const shouldThrow = () =>
      serverLoginResponse(
        serverEphemeral.secret,
        clientEphemeral.public,
        salt,
        'username-login',
        verifier,
        clientSession.proof
      )
    expect(shouldThrow).toThrowError('Client provided session proof is invalid')
  })
})
