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
import api from '~/src/client/api'
import { unlockKeychain } from '~/src/client/engine/account'
import { saveKey } from '~/src/client/engine/keyStorage'
import useErrorToast from '~/src/client/hooks/useErrorToast'

interface AuthInfo {
  userID: string
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
  const [authInfo, setAuthInfo] = React.useState<AuthInfo>(null)
  const [showTwoFactor, setShowTwoFactor] = React.useState(false)
  const showErrorToast = useErrorToast()

  const verifyTwoFactor = use2faVerification()
  const redirectAfterLogin = useRedirectAfterLogin()

  const login = async (username: string, password: string) => {
    const {
      userID,
      challengeID,
      srpSalt,
      ephemeral: serverEphemeral
    } = await api.post<LoginChallengeParameters, LoginChallengeResponseBody>(
      '/auth/login/challenge',
      { username }
    )

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
      twoFactor,
      masterSalt,
      auth
    }: LoginResponseResponseBody = await api.post(
      '/auth/login/response',
      responseParams
    )

    await clientVerifyLogin(serverProof, clientEphemeral, session)

    setAuthInfo({
      userID,
      // Store credentials for post-2FA KDF
      username: twoFactor ? username : null,
      password: twoFactor ? password : null
    })
    if (twoFactor) {
      return setShowTwoFactor(true)
    }
    if (auth && masterSalt) {
      saveLoginCredentials(auth)
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
    const { masterSalt, ...auth } = await verifyTwoFactor({
      twoFactorToken: token
    })
    saveLoginCredentials(auth)
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

  return {
    login: (...args) =>
      login(...args).catch(e => showErrorToast(e, 'Authentication Error')),
    enterTwoFactorToken: (...args) =>
      enterTwoFactorToken(...args).catch(e =>
        showErrorToast(e, 'Authentication Error')
      ),
    showTwoFactor
  }
}
