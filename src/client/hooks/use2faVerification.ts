import { clientApi } from '~/src/client/api'
import {
  Login2FAParameters,
  Login2FAResponseBody
} from '~/pages/api/auth/login/2fa'

export default function use2faVerification() {
  const verify = async (
    params: Login2FAParameters
  ): Promise<Login2FAResponseBody> => {
    return await clientApi.post('/auth/login/2fa', params)
  }
  return verify
}
