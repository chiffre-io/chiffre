import React from 'react'
import AuthPage from '../views/auth/AuthPage'
import LoginForm from '../views/auth/LoginForm'
import TwoFactorForm from '../views/auth/TwoFactorForm'
import { useChiffreClient } from '@chiffre/client-react'

const LoginPage = () => {
  const client = useChiffreClient()
  const [show2fa, setShow2fa] = React.useState(false)

  return (
    <AuthPage>
      {!show2fa && (
        <LoginForm
          onSubmit={async values => {
            const { requireTwoFactorAuthentication } = await client.login(
              values.email,
              values.password
            )
            if (requireTwoFactorAuthentication) {
              setShow2fa(true)
            }
            // else => redirect
          }}
        />
      )}
      {show2fa && (
        <TwoFactorForm
          autoFocus
          onSubmit={async values => {
            await client.verifyTwoFactorToken(values.twoFactorToken)
            // todo: redirect
          }}
        />
      )}
    </AuthPage>
  )
}

export default LoginPage
