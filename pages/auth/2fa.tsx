import React from 'react'
import { useRouter } from 'next/dist/client/router'
import AuthPage from '~/src/client/views/auth/AuthPage'
import TwoFactorForm from '~/src/client/views/auth/TwoFactorForm'
import use2faVerification from '~/src/client/hooks/use2faVerification'
import { saveLoginCredentials } from '../../src/client/auth'

const uniqueString = (value: string | string[]) =>
  typeof value === 'string'
    ? value
    : value === null || value === undefined
    ? null
    : value[0]

const useQueryParams = () => {
  const router = useRouter()
  if (!router) {
    return { userID: null, sessionID: null }
  }
  let { user, session } = router.query
  return {
    userID: uniqueString(user),
    sessionID: uniqueString(session)
  }
}

const TwoFactorPage = () => {
  const router = useRouter()
  const { userID, sessionID } = useQueryParams()
  const verify = use2faVerification()

  return (
    <AuthPage>
      <TwoFactorForm
        onSubmit={async values => {
          const { jwt } = await verify({
            userID,
            sessionID,
            twoFactorToken: values.twoFactorToken
          })
          saveLoginCredentials(jwt)
          await router.push('/')
        }}
      />
    </AuthPage>
  )
}

export default TwoFactorPage
