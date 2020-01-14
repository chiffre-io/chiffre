import axios, { AxiosInstance } from 'axios'
import {
  createSignupEntities,
  clientAssembleLoginResponse,
  deriveMasterKey,
  clientVerifyLogin,
  unlockKeychain
} from '@chiffre/crypto'
import {
  SignupParameters,
  LoginChallengeResponseBody,
  KeychainResponse,
  LoginResponseParameters,
  Login2FAParameters,
  LoginResponseResponseBody,
  Login2FAResponseBody
} from '@chiffre/api-types'
import SessionKeystore from 'session-keystore'
import { decryptString, CloakKey } from '@47ng/cloak'

const inSevenDays = () => Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days

export default class Client {
  private api: AxiosInstance
  private keystore: SessionKeystore<'keychainKey' | 'credentials'>

  constructor(url: string) {
    this.api = axios.create({
      baseURL: `${url}/v1`
    })
    this.keystore = new SessionKeystore({
      name: 'chiffre-client'
    })
  }

  public async signup(username: string, password: string) {
    const signupParams: SignupParameters = await createSignupEntities(
      username,
      password
    )
    const masterKey = await deriveMasterKey(
      username,
      password,
      signupParams.masterSalt
    )
    await this.api.post('/auth/signup', signupParams)
    this.keystore.set(
      'keychainKey',
      await decryptString(signupParams.keychainKey, masterKey),
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    )
  }

  public async login(username: string, password: string) {
    const res1 = await this.api.post('/auth/login/challenge', { username })
    const challengeResponse: LoginChallengeResponseBody = res1.data
    const response = await clientAssembleLoginResponse(
      username,
      password,
      challengeResponse.srpSalt,
      challengeResponse.ephemeral
    )
    const responseParams: LoginResponseParameters = {
      userID: challengeResponse.userID,
      challengeID: challengeResponse.challengeID,
      ephemeral: response.ephemeral.public,
      proof: response.session.proof
    }
    const res2 = await this.api.post('/v1/auth/login/response', responseParams)
    const responseBody: LoginResponseResponseBody = res2.data
    await clientVerifyLogin(
      responseBody.proof,
      response.ephemeral,
      response.session
    )

    if (responseBody.masterSalt) {
      const masterKey = await deriveMasterKey(
        username,
        password,
        responseBody.masterSalt
      )
      await this.refreshKeychain(masterKey)
      return { requireTwoFactorAuthentication: false }
    } else {
      // Two factor is required
      this.keystore.set(
        'credentials',
        [username, password].join(':'),
        Date.now() + 60 * 1000 // 1 minute, to let 2FA flow happen
      )
      return { requireTwoFactorAuthentication: true }
    }
  }

  public async verifyTwoFactorToken(token: string) {
    const credentials = this.keystore.get('credentials')
    if (!credentials) {
      throw new Error('Session expired, please log in again')
    }
    const [username, password] = credentials.split(':')
    const body: Login2FAParameters = {
      twoFactorToken: token
    }
    const res = await this.api.post('/auth/login/2fa', body)
    const responseBody: Login2FAResponseBody = res.data
    const masterKey = await deriveMasterKey(
      username,
      password,
      responseBody.masterSalt
    )
    this.keystore.delete('credentials')
    await this.refreshKeychain(masterKey)
  }

  public async refreshKeychain(masterKey: CloakKey) {
    const res = await this.api.get('/keychain')
    const responseBody: KeychainResponse = res.data
    const keychainKey = await decryptString(responseBody.key, masterKey)
    this.keystore.set('keychainKey', keychainKey, inSevenDays())
    return await unlockKeychain(responseBody, keychainKey)
  }
}
