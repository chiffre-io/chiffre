import React from 'react'
import AuthPage from '../src/client/views/auth/AuthPage'
import SignupForm from '../src/client/views/auth/SignupForm'

const SignupPage = () => {
  return (
    <AuthPage>
      <SignupForm onSubmit={console.log} />
    </AuthPage>
  )
}

export default SignupPage
