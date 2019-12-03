import React from 'react'
import { useRouter } from 'next/dist/client/router'
import {
  clientAssembleLoginResponse,
  clientVerifyLogin
} from '../engine/crypto/srp'
import { LoginChallengeResponseBody } from '~/pages/api/auth/login/challenge'
import {
  LoginResponseParameters,
  LoginResponseResponseBody
} from '~/pages/api/auth/login/response'
import { saveLoginCredentials } from '../auth'
import use2faVerification from './use2faVerification'
import { publicApi } from '../api'

interface AuthInfo {
  userID: string
  sessionID: string
}

interface Return {
  login: (username: string, password: string) => Promise<any>
  enterTwoFactorToken: (token: string) => Promise<any>
  showTwoFactor: boolean
}

const useRedirectAfterLogin = (defaultRoute = '/') => {
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
    let res = await publicApi.post('/auth/login/challenge', { username })
    if (res.status !== 200) {
      throw new Error(res.data.error)
    }
    const {
      userID,
      challengeID,
      salt,
      ephemeral: serverEphemeral
    }: LoginChallengeResponseBody = res.data

    const {
      session,
      ephemeral: clientEphemeral
    } = await clientAssembleLoginResponse(
      username,
      password,
      salt,
      serverEphemeral
    )

    const responseParams: LoginResponseParameters = {
      userID,
      challengeID,
      ephemeral: clientEphemeral.public,
      proof: session.proof
    }
    res = await publicApi.post('/auth/login/response', responseParams)
    if (res.status !== 200) {
      throw new Error(res.data.error)
    }
    const {
      proof: serverProof,
      jwt,
      twoFactor,
      sessionID
    }: LoginResponseResponseBody = res.data

    await clientVerifyLogin(serverProof, clientEphemeral, session)

    setAuthInfo({
      userID,
      sessionID
    })
    if (twoFactor) {
      setShowTwoFactor(true)
    } else if (jwt) {
      setError(null)
      saveLoginCredentials(jwt)
      await redirectAfterLogin()
    }
  }

  const enterTwoFactorToken = async (token: string) => {
    const { jwt } = await verifyTwoFactor({
      userID: authInfo.userID,
      sessionID: authInfo.sessionID,
      twoFactorToken: token
    })
    if (jwt) {
      setError(null)
      saveLoginCredentials(jwt)
      await redirectAfterLogin()
    }
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
