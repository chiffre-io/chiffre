import React from 'react'
import axios from 'axios'
import {
  clientAssembleLoginResponse,
  clientVerifyLogin
} from '../engine/crypto/srp'
import { LoginChallengeResponseBody } from '~/pages/api/auth/login/challenge'
import {
  LoginResponseParameters,
  LoginResponseResponseBody
} from '~/pages/api/auth/login/response'

export default function useSrpLogin() {
  const [error, setError] = React.useState<Error>(null)

  const login = async (username: string, password: string) => {
    let res = await axios.post('/api/auth/login/challenge', { username })
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
    res = await axios.post('/api/auth/login/response', responseParams)
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

    return {
      userID,
      jwt,
      twoFactor,
      sessionID
    }
  }

  return {
    login,
    error
  }
}
