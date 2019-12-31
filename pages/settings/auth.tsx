import { NextPage, NextPageContext } from 'next'
import { authenticatePage } from '~/src/shared/auth'
import { AuthClaims } from '~/src/shared/auth'
import TwoFactorSetup from '~/src/client/views/auth/2fa/TwoFactorSetup'

export interface Props extends AuthClaims {}

const AuthSettingsPage: NextPage<Props> = ({ ...props }) => {
  return <TwoFactorSetup />
}

AuthSettingsPage.getInitialProps = async (ctx: NextPageContext) => {
  const auth = await authenticatePage(ctx)
  return auth
}

export default AuthSettingsPage
