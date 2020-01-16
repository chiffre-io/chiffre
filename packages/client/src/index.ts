import axios, { AxiosInstance, AxiosResponse } from 'axios'
import SessionKeystore from 'session-keystore'
import { b64, utf8 } from '@47ng/codec'
import {
  generateKey,
  encryptString,
  decryptString as decloakString,
  CloakKey
} from '@47ng/cloak'
import { decryptString as unboxString } from '@chiffre/crypto-base'
import {
  createSignupEntities,
  clientAssembleLoginResponse,
  deriveMasterKey,
  clientVerifyLogin,
  unlockKeychain,
  UnlockedKeychain,
  createProject,
  lockProject,
  UnlockedProject,
  unlockProject
} from '@chiffre/crypto-client'
import {
  SignupParameters,
  LoginChallengeResponseBody,
  KeychainResponse,
  LoginResponseParameters,
  Login2FAParameters,
  LoginResponseResponseBody,
  Login2FAResponseBody,
  Project as ProjectResponse,
  CreateVaultParameters,
  CreateVaultResponse,
  FindVaultResponse,
  CreateProjectParameters,
  CreateProjectResponse,
  AuthClaims,
  CookieNames,
  Plans,
  ActivityResponse,
  getExpirationDate,
  maxAgeInSeconds
} from '@chiffre/api-types'
import type { Settings } from './settings'
import TwoFactorSettings from './settings/2fa'

// --

export interface Project {
  id: string
  vaultID: string
  publicKey: string
  embedScript: string,
  decryptMessage: (message: string) => string
}

export interface Identity {
  username: string
  userID: string
  plan: Plans
  publicKeys: {
    signature: Uint8Array
    sharing: Uint8Array
  }
}

export interface ClientOptions {
  /**
   * The URL to the Chiffre API, defaults to https://api.chiffre.io
   */
  apiURL?: string

  /**
   * Callback function when the internal state is updated.
   * Will not be called when locked.
   */
  onUpdate?: () => void

  /**
   * Callback function when the keychain self-locks after some amount of time.
   */
  onLocked?: () => void
}

// --

const buildMessageDecryptor = (project: UnlockedProject) =>
  function decryptMessage(message: string) {
    return unboxString(message, project.keyPair.secretKey)
  }

// --

const cookieClaimsRegex = new RegExp(`${CookieNames.jwt}=([\w-]+).([\w-]+)`)

export default class Client {
  public projects: Project[]
  public settings: Settings

  #api: AxiosInstance
  #keystore: SessionKeystore<'keychainKey' | 'credentials'>
  #handleAuth: (res: AxiosResponse) => void
  #token?: string
  #authClaims?: AuthClaims
  #username?: string
  #keychain?: UnlockedKeychain
  #onUpdate: () => void

  constructor(options: ClientOptions = {}) {
    this.#api = axios.create({
      baseURL: `${options.apiURL || 'https://api.chiffre.io'}/v1`,
      // Use cookies in the browser
      withCredentials: typeof document !== 'undefined',
    })
    this.#api.defaults.headers.common['Content-Type'] = 'application/json'
    if (typeof document === 'undefined') {
      // Manually inject bearer token in Node.js
      this.#api.interceptors.request.use((config) => {
        if (!this.#token) {
          return config
        }
        config.headers = {
          ...config.headers,
          authorization: `Bearer ${this.#token}`
        }
        return config
      })
    }

    this.projects = []
    this.#token = undefined
    this.#authClaims = undefined
    this.#username = undefined
    this.#keychain = undefined
    this.#keystore = new SessionKeystore({
      name: 'chiffre-client',
      onExpired: (keyName) => {
        if (keyName === 'keychainKey') {
          this.lock()
          if (options.onLocked) {
            options.onLocked()
          }
        }
      }
    })
    this.#onUpdate = options.onUpdate || (() => {})
    this.#handleAuth = (res: AxiosResponse) => {
      const parsePayload = (payload: string): AuthClaims => {
        const p = JSON.parse(utf8.decode(b64.decode(payload)))
        return {
          plan: p.plan,
          userID: p.sub,
          tokenID: p.jti,
          twoFactorStatus: p['2fa']
        }
      }

      if (typeof document !== 'undefined') {
        // We're in the browser, just parse the claims cookie
        try {
          const matches = document.cookie.match(cookieClaimsRegex)
          if (matches.length !== 3) {
            throw new Error('Invalid JWT')
          }
          this.#authClaims = parsePayload(matches[2])
        } catch {
          this.#authClaims = undefined
        }
        return
      }
      const cookies: string[] = res.headers['set-cookie']
      this.#token = cookies
        .map(cookie => cookie.split(';')[0]) // Remove scope definitions
        .filter(cookie => {
          // Keep only auth cookies
          const [name] = cookie.split('=')
          return [
            CookieNames.jwt as string,
            CookieNames.sig as string
          ].includes(name)
        })
        .map(cookie => cookie.split('=')[1]) // Extract the values
        .join('.') // Recompose JWT

      // Parse auth claims
      const [_header, payload, _signature] = this.#token.split('.')
      try {
        this.#authClaims = parsePayload(payload)
      } catch {
        this.#authClaims = undefined
      } finally {
        this.#onUpdate()
      }
    }
    this.settings = {
      twoFactor: new TwoFactorSettings(
        this.#api,
        this.#handleAuth,
        () => this.#authClaims
      )
    }
    // Hydrate keychain after a page reload
    if (this.#keystore.get('keychainKey')) {
      this._refresh()
    }
  }

  // --

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
    const res = await this.#api.post('/auth/signup', signupParams)
    this.#username = username
    const keychainKey = await decloakString(signupParams.keychainKey, masterKey)
    this.#keychain = await unlockKeychain(signupParams.keychain, keychainKey)
    this.#keystore.set(
      'keychainKey',
      keychainKey,
      getExpirationDate(maxAgeInSeconds.session)
    )
    this.#handleAuth(res)
  }

  public async login(username: string, password: string) {
    const res1 = await this.#api.post('/auth/login/challenge', { username })
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
    const res2 = await this.#api.post('/auth/login/response', responseParams)
    const responseBody: LoginResponseResponseBody = res2.data
    await clientVerifyLogin(
      responseBody.proof,
      response.ephemeral,
      response.session
    )
    this.#handleAuth(res2)
    this.#username = username

    if (responseBody.masterSalt) {
      const masterKey = await deriveMasterKey(
        username,
        password,
        responseBody.masterSalt
      )
      await this._refreshKeychain(masterKey)
      await this._refresh()
      return { requireTwoFactorAuthentication: false }
    } else {
      // Two factor is required
      this.#keystore.set(
        'credentials',
        [username, password].join(':'),
        getExpirationDate(60) // 1 minute, to let 2FA flow happen
      )
      return { requireTwoFactorAuthentication: true }
    }
  }

  public async verifyTwoFactorToken(token: string) {
    const credentials = this.#keystore.get('credentials')
    if (!credentials) {
      throw new Error('Session expired, please log in again')
    }
    const [username, password] = credentials.split(':')
    const body: Login2FAParameters = {
      twoFactorToken: token
    }
    const res = await this.#api.post('/auth/login/2fa', body)
    const responseBody: Login2FAResponseBody = res.data
    const masterKey = await deriveMasterKey(
      username,
      password,
      responseBody.masterSalt
    )
    this.#keystore.delete('credentials')
    this.#handleAuth(res)
    await this._refreshKeychain(masterKey)
    await this._refresh()
  }

  // --

  public get isLocked(): boolean {
    return !(
      this.#keychain &&
      this.#username &&
      this.#authClaims &&
      this.#keystore.get('keychainKey')
    )
  }

  public get identity(): Identity | null {
    if (this.isLocked) {
      return null
    }
    return {
      username: this.#username,
      userID: this.#authClaims.userID,
      plan: this.#authClaims.plan,
      publicKeys: {
        signature: this.#keychain.signature.publicKey,
        sharing: this.#keychain.sharing.publicKey
      }
    }
  }

  public async getAccountActivity(): Promise<ActivityResponse[]> {
    const res = await this.#api.get('/activity')
    const events: ActivityResponse[] = res.data
    return events.map(event => ({
      ...event,
      date: new Date(event.date)
    }))
  }

  // --

  public lock() {
    this.projects = []
    this.#keychain = undefined
    this.#keystore.clear()
    this.#authClaims = undefined
    this.#username = undefined
    this.#token = undefined
  }

  // --

  private async _refreshKeychain(masterKey: CloakKey) {
    const res = await this.#api.get('/keychain')
    const responseBody: KeychainResponse = res.data
    const keychainKey = await decloakString(responseBody.key, masterKey)
    this.#keystore.set(
      'keychainKey',
      keychainKey,
      getExpirationDate(maxAgeInSeconds.session)
    )
    this.#keychain = await unlockKeychain(responseBody, keychainKey)
  }

  private async _refresh() {
    const keychainKey = this.#keystore.get('keychainKey')
    if (!keychainKey) {
      throw new Error('Session expired, please login again')
    }
    // Refresh projects
    const res = await this.#api.get('/projects')
    const responseBody: ProjectResponse[] = res.data
    const projects: Project[] = []
    for (const project of responseBody) {
      const vaultKey = await decloakString(project.vaultKey, keychainKey)
      const unlockedProject = await unlockProject(project, vaultKey)
      projects.push({
        id: project.id,
        vaultID: project.vaultID,
        publicKey: project.keys.public,
        embedScript: project.embedScript,
        decryptMessage: buildMessageDecryptor(unlockedProject)
      })
    }
    this.projects = projects
    this.#onUpdate()
  }

  // Projects --

  public async createProject(vaultID?: string): Promise<Project> {
    // We will need this for unlocking the vault key
    // make sure it's available early before starting the process
    const keychainKey = this.#keystore.get('keychainKey')
    if (!keychainKey) {
      throw new Error('Session expired, please log in again')
    }

    // Retrieve the vault key, or create one if vaultID is not specified
    let vaultKey: CloakKey
    if (!vaultID) {
      // Create a new vault
      vaultKey = generateKey()
      const encryptedVaultKey = await encryptString(vaultKey, keychainKey)
      const createVaultParams: CreateVaultParameters = {
        key: encryptedVaultKey
      }
      const res = await this.#api.post('/vaults', createVaultParams)
      const responseBody: CreateVaultResponse = res.data
      vaultID = responseBody.vaultID
    } else {
      // Use an existing vault
      const res = await this.#api.get(`/vaults/${vaultID}`)
      const responseBody: FindVaultResponse = res.data
      vaultKey = await decloakString(responseBody.key, keychainKey)
    }

    // Create the project and associate it with the vault
    const unlockedProject = createProject()
    const lockedProject = await lockProject(unlockedProject, vaultKey)
    const createProjectParams: CreateProjectParameters = {
      vaultID,
      publicKey: lockedProject.keys.public,
      secretKey: lockedProject.keys.secret
    }
    const res = await this.#api.post('/projects', createProjectParams)
    const responseBody: CreateProjectResponse = res.data
    const project: Project = {
      id: responseBody.projectID,
      vaultID,
      publicKey: lockedProject.keys.public,
      embedScript: responseBody.embedScript,
      decryptMessage: buildMessageDecryptor(unlockedProject)
    }
    this.projects.push(project)
    return project
  }

  public getProject(id: string) {
    return this.projects.find((p => p.id === id))
  }
}
