import React from 'react'
import { useChiffreClient } from '@chiffre/client-react'
import { useRouter } from 'next/dist/client/router'
import AuthPage from '../views/auth/AuthPage'
import SignupForm, { Values } from '../views/auth/SignupForm'
import useErrorToast from '../hooks/useErrorToast'
import useQueryString from '../hooks/useQueryString'

const SignupPage = () => {
  const showErrorToast = useErrorToast()
  const client = useChiffreClient()
  const router = useRouter()
  const redirectUrl = useQueryString('redirect')

  const onSubmit = async (values: Values) => {
    const { email: username, password } = values
    try {
      await client.signup(username, password)
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
