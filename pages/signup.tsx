import React from 'react'
import AuthPage from '~/src/client/views/auth/AuthPage'
import SignupForm, { Values } from '~/src/client/views/auth/SignupForm'
import { useRouter } from 'next/dist/client/router'
import { clientSignup } from '../src/client/engine/crypto/srp'
import axios from 'axios'

const SignupPage = () => {
  const router = useRouter()
  const onSubmit = async (values: Values) => {
    const params = await clientSignup(values.email, values.password)
    const res = await axios.post('/api/auth/signup', params)
    if (res.status === 201) {
      return await router.push('/login')
    }
  }

  return (
    <AuthPage>
      <SignupForm onSubmit={onSubmit} />
    </AuthPage>
  )
}

export default SignupPage
