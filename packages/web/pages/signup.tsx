import React from 'react'
import { useRouter } from 'next/dist/client/router'
import AuthPage from '../src/views/auth/AuthPage'
import SignupForm, { Values } from '../src/views/auth/SignupForm'
import useErrorToast from '../src/hooks/useErrorToast'
import useQueryString from '../src/hooks/useQueryString'

const SignupPage = () => {
  const showErrorToast = useErrorToast()

  const router = useRouter()
  const redirectUrl = useQueryString('redirect')

  const onSubmit = async (values: Values) => {
    const { email: username, password } = values

    // try {
    //   const params = await createSignupEntities(username, password)
    //   type Req = SignupParameters
    //   type Res = SignupResponse
    //   const auth = await api.post<Req, Res>('/auth/signup', params)
    //   saveLoginCredentials(auth)
    //   const {
    //     keychainKey,
    //     signatureSecretKey,
    //     sharingSecretKey
    //   } = await unlockKeychain(username, password, params.masterSalt)
    //   saveKey('keychain', keychainKey)
    //   saveKey('signature', signatureSecretKey)
    //   saveKey('sharing', sharingSecretKey)
    //   return await router.push(redirectUrl || '/dashboard')
    // } catch (error) {
    //   showErrorToast(error)
    // }
  }

  return (
    <AuthPage>
      <SignupForm onSubmit={onSubmit} />
    </AuthPage>
  )
}

export default SignupPage
