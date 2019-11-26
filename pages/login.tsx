import React from 'react'
import { useRouter } from 'next/dist/client/router'
import AuthPage from '~/src/client/views/auth/AuthPage'
import LoginForm from '~/src/client/views/auth/LoginForm'
import useSrpLogin from '../src/client/hooks/useSrpLogin'

const LoginPage = () => {
  const router = useRouter()
  const { login } = useSrpLogin()

  return (
    <AuthPage>
      <LoginForm
        onSubmit={async values => {
          const { jwt, twoFactor } = await login(values.email, values.password)
          if (twoFactor) {
            return await router.push('/auth/2fa')
          } else if (jwt) {
            console.log({ jwt })
          }
        }}
      />
    </AuthPage>
  )
}

export default LoginPage
