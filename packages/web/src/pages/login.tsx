import React from 'react'
import { useRouter } from 'next/dist/client/router'
import { useChiffreClient } from '../hooks/useChiffreClient'
import AuthPage from '../views/auth/AuthPage'
import LoginForm from '../views/auth/LoginForm'
import TwoFactorForm from '../views/auth/TwoFactorForm'
import useQueryString from '../hooks/useQueryString'
import useErrorToast from '../hooks/useErrorToast'

const LoginPage = () => {
  const showErrorToast = useErrorToast()
  const client = useChiffreClient()
  const [show2fa, setShow2fa] = React.useState(false)
  const router = useRouter()
  const redirectUrl = useQueryString('redirect')

  return (
    <AuthPage>
      {!show2fa && (
        <LoginForm
          onSubmit={async values => {
            try {
              const { requireTwoFactorAuthentication } = await client.login(
                values.email,
                values.password
              )
              if (requireTwoFactorAuthentication) {
                setShow2fa(true)
              } else {
                await router.push(redirectUrl || '/dashboard')
              }
            } catch (error) {
              showErrorToast(error)
            }
          }}
        />
      )}
      {show2fa && (
        <TwoFactorForm
          autoFocus
          onSubmit={async values => {
            try {
              await client.verifyTwoFactorToken(values.twoFactorToken)
              return await router.push(redirectUrl || '/dashboard')
            } catch (error) {
              showErrorToast(error)
            }
          }}
        />
      )}
    </AuthPage>
  )
}

export default LoginPage
