import React from 'react'
import { useRouter } from 'next/dist/client/router'
import AuthPage from '~/src/client/views/auth/AuthPage'
import SignupForm, { Values } from '~/src/client/views/auth/SignupForm'
import useErrorToast from '~/src/client/hooks/useErrorToast'
import { clientSignup } from '~/src/client/engine/crypto/srp'
import { publicApi } from '~/src/client/api'

const SignupPage = () => {
  const showErrorToast = useErrorToast()

  const router = useRouter()
  const onSubmit = async (values: Values) => {
    try {
      const params = await clientSignup(values.email, values.password)
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
