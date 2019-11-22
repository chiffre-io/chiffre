import React from 'react'
import AuthPage from '../src/client/views/auth/AuthPage'
import SignupForm, { Values } from '../src/client/views/auth/SignupForm'
import { useRouter } from 'next/dist/client/router'

const SignupPage = () => {
  const router = useRouter()
  const onSubmit = async (values: Values) => {
    await new Promise(r => setTimeout(r, 2000))
    return await router.push('/login')
  }

  return (
    <AuthPage>
      <SignupForm onSubmit={onSubmit} />
    </AuthPage>
  )
}

export default SignupPage
