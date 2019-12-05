import React from 'react'
import AuthPage from '~/src/client/views/auth/AuthPage'
import LoginForm from '~/src/client/views/auth/LoginForm'
import TwoFactorForm from '~/src/client/views/auth/TwoFactorForm'
import useSrpLogin from '~/src/client/hooks/useSrpLogin'

const LoginPage = () => {
  const { login, enterTwoFactorToken, showTwoFactor } = useSrpLogin()
  return (
    <AuthPage>
      {!showTwoFactor && (
        <LoginForm
          onSubmit={async values => {
            window.Chiffre.sendEvent('login:submit', { username: values.email })
            await login(values.email, values.password)
          }}
        />
      )}
      {showTwoFactor && (
        <TwoFactorForm
          onSubmit={async values => {
            window.Chiffre.sendEvent('login:2fa')
            await enterTwoFactorToken(values.twoFactorToken)
          }}
        />
      )}
    </AuthPage>
  )
}

export default LoginPage
