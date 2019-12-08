import React from 'react'
import { useRouter } from 'next/dist/client/router'
import AuthPage from '~/src/client/views/auth/AuthPage'
import SignupForm, { Values } from '~/src/client/views/auth/SignupForm'
import useErrorToast from '~/src/client/hooks/useErrorToast'
import { publicApi } from '~/src/client/api'
import {
  createSignupEntities,
  unlockKeychain
} from '~/src/client/engine/account'
import { saveLoginCredentials } from '~/src/client/auth'
import { SignupParameters, SignupResponse } from '~/pages/api/auth/signup'
import { saveKeychainKey } from '~/src/client/engine/keyStorage'
import useQueryString from '~/src/client/hooks/useQueryString'

const SignupPage = () => {
  const showErrorToast = useErrorToast()

  const router = useRouter()
  const redirectUrl = useQueryString('redirect')

  const onSubmit = async (values: Values) => {
    const { email: username, password } = values

    try {
      const params = await createSignupEntities(username, password)
      type Req = SignupParameters
      type Res = SignupResponse
      const { jwt } = await publicApi.post<Req, Res>('/auth/signup', params)
      saveLoginCredentials(jwt)
      const keychainKey = await unlockKeychain(
        username,
        password,
        params.masterSalt
      )
      await saveKeychainKey(keychainKey, false)
      return await router.push(redirectUrl || '/dashboard')
    } catch (error) {
      showErrorToast(error)
    }
  }

  return (
    <AuthPage>
      <SignupForm onSubmit={onSubmit} />
    </AuthPage>
  )
}

export default SignupPage
