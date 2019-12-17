import React from 'react'
import { useRouter } from 'next/dist/client/router'
import {
  clientAssembleLoginResponse,
  clientVerifyLogin
} from '~/src/client/engine/crypto/srp'
import {
  LoginChallengeResponseBody,
  LoginChallengeParameters
} from '~/pages/api/auth/login/challenge'
import {
  LoginResponseParameters,
  LoginResponseResponseBody
} from '~/pages/api/auth/login/response'
import { saveLoginCredentials } from '~/src/client/auth'
import use2faVerification from './use2faVerification'
import { publicApi } from '~/src/client/api'
import { unlockKeychain } from '~/src/client/engine/account'
import { saveKey } from '~/src/client/engine/keyStorage'

interface AuthInfo {
  userID: string
  sessionID: string
  username: string
  password: string
}

interface Return {
  login: (username: string, password: string) => Promise<any>
  enterTwoFactorToken: (token: string) => Promise<any>
  showTwoFactor: boolean
}

const useRedirectAfterLogin = (defaultRoute = '/dashboard') => {
  const router = useRouter()
  if (!router || !router.query) {
    // Server-side
    return async () => false
  }
  const { redirect = defaultRoute } = router.query
  const redirectPath = typeof redirect === 'string' ? redirect : redirect[0]
  return async () => await router.replace(redirectPath)
}

export default function useSrpLogin(): Return {
  const [error, setError] = React.useState<Error>(undefined)
  const [authInfo, setAuthInfo] = React.useState<AuthInfo>(null)
  const [showTwoFactor, setShowTwoFactor] = React.useState(false)

  const verifyTwoFactor = use2faVerification()
  const redirectAfterLogin = useRedirectAfterLogin()

  const login = async (username: string, password: string) => {
    const {
      userID,
      challengeID,
      srpSalt,
      ephemeral: serverEphemeral
    } = await publicApi.post<
      LoginChallengeParameters,
      LoginChallengeResponseBody
    >('/auth/login/challenge', { username })

    const {
      session,
      ephemeral: clientEphemeral
    } = await clientAssembleLoginResponse(
      username,
      password,
      srpSalt,
      serverEphemeral
    )

    const responseParams: LoginResponseParameters = {
      userID,
      challengeID,
      ephemeral: clientEphemeral.public,
      proof: session.proof
    }
    const {
      proof: serverProof,
      jwt,
      masterSalt,
      twoFactor,
      sessionID
    }: LoginResponseResponseBody = await publicApi.post(
      '/auth/login/response',
      responseParams
    )

    await clientVerifyLogin(serverProof, clientEphemeral, session)

    setAuthInfo({
      userID,
      sessionID,
      // Store credentials for post-2FA KDF
      username: twoFactor ? null : username,
      password: twoFactor ? null : password
    })
    if (twoFactor) {
      return setShowTwoFactor(true)
    }
    if (jwt && masterSalt) {
      setError(null)
      saveLoginCredentials(jwt)
      const {
        keychainKey,
        signatureSecretKey,
        sharingSecretKey
      } = await unlockKeychain(username, password, masterSalt)
      saveKey('keychain', keychainKey)
      saveKey('signature', signatureSecretKey)
      saveKey('sharing', sharingSecretKey)
      await redirectAfterLogin()
    }
  }

  const enterTwoFactorToken = async (token: string) => {
    const { jwt, masterSalt } = await verifyTwoFactor({
      userID: authInfo.userID,
      sessionID: authInfo.sessionID,
      twoFactorToken: token
    })
    setError(null)
    saveLoginCredentials(jwt)
    const {
      keychainKey,
      signatureSecretKey,
      sharingSecretKey
    } = await unlockKeychain(authInfo.username, authInfo.password, masterSalt)
    saveKey('keychain', keychainKey)
    saveKey('signature', signatureSecretKey)
    saveKey('sharing', sharingSecretKey)
    await redirectAfterLogin()
  }

  const saveAndThrowBack = (error: Error) => {
    setError(error) // For the UI to display
    throw error // For the original caller to catch
  }

  React.useEffect(() => {
    if (error) {
      // todo: Show using a toast
      console.error(error)
    }
  }, [error])

  return {
    login: (...args) => login(...args).catch(saveAndThrowBack),
    enterTwoFactorToken: (...args) =>
      enterTwoFactorToken(...args).catch(saveAndThrowBack),
    showTwoFactor
  }
}
