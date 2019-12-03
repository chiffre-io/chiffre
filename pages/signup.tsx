import React from 'react'
import { useRouter } from 'next/dist/client/router'
import AuthPage from '~/src/client/views/auth/AuthPage'
import SignupForm, { Values } from '~/src/client/views/auth/SignupForm'
import useErrorToast from '~/src/client/hooks/useErrorToast'
import { publicApi } from '~/src/client/api'
import { createSignupEntities } from '~/src/client/engine/account'

const SignupPage = () => {
  const showErrorToast = useErrorToast()

  const router = useRouter()
  const onSubmit = async (values: Values) => {
    const { email: username, password } = values

    try {
      const params = await createSignupEntities(username, password)
      console.dir(params)
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
