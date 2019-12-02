import { NextPage, NextPageContext } from 'next'
import { authenticatedPage } from '~/src/shared/auth'
import { JwtClaims } from '~/src/server/jwt'
import TwoFactorSetup from '~/src/client/views/auth/2fa/TwoFactorSetup'

export interface Props extends JwtClaims {}

const AuthSettingsPage: NextPage<Props> = ({ ...props }) => {
  return <TwoFactorSetup />
}

AuthSettingsPage.getInitialProps = async (ctx: NextPageContext) => {
  const auth = await authenticatedPage(ctx)
  return auth
}

export default AuthSettingsPage
