import React from 'react'
import { useRouter } from 'next/dist/client/router'
import AuthPage from '~/src/client/views/auth/AuthPage'
import SignupForm, { Values } from '~/src/client/views/auth/SignupForm'
import useErrorToast from '~/src/client/hooks/useErrorToast'
import { clientSignup } from '~/src/client/engine/crypto/srp'
import { publicApi } from '~/src/client/api'
import { SignupParameters } from './api/auth/signup'
import {
  createKeychain,
  createKeychainKey,
  lockKeychain,
  getKeychainPublicKeys
} from '~/src/client/engine/keychain'

const SignupPage = () => {
  const showErrorToast = useErrorToast()

  const router = useRouter()
  const onSubmit = async (values: Values) => {
    const { email: username, password } = values

    try {
      const srpParams = await clientSignup(username, password)
      const keychain = createKeychain()
      const { key: keychainKey, salt: keychainSalt } = await createKeychainKey(
        username,
        password
      )
      const lockedKeychain = await lockKeychain(keychain, keychainKey)
      const params: SignupParameters = {
        ...srpParams,
        keychain: {
          salt: keychainSalt,
          encrypted: lockedKeychain,
          ...getKeychainPublicKeys(keychain)
        }
      }
      const res = await publicApi.post('/auth/signup', params)
      if (res.status === 201) {
        return await router.push('/login')
      }
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
