import React from 'react'
import AuthPage from '../src/views/auth/AuthPage'
import LoginForm from '../src/views/auth/LoginForm'
import TwoFactorForm from '../src/views/auth/TwoFactorForm'
// import useSrpLogin from '../src/hooks/useSrpLogin'

const LoginPage = () => {
  // const { login, enterTwoFactorToken, showTwoFactor } = useSrpLogin()
  return (
    <AuthPage>
      <LoginForm
        onSubmit={async values => {
          // await login(values.email, values.password)
        }}
      />
      <TwoFactorForm
        autoFocus
        onSubmit={async values => {
          // await enterTwoFactorToken(values.twoFactorToken)
        }}
      />
    </AuthPage>
  )
}

export default LoginPage
