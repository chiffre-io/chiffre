import { NextPage } from 'next'
import TwoFactorSetup from '../../views/auth/2fa/TwoFactorSetup'

const AuthSettingsPage: NextPage = ({ ...props }) => {
  return <TwoFactorSetup />
}

export default AuthSettingsPage
