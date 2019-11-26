import axios from 'axios'
import {
  Login2FAParameters,
  Login2FAResponseBody
} from '~/pages/api/auth/login/2fa'

export default function use2faVerification() {
  const verify = async (
    params: Login2FAParameters
  ): Promise<Login2FAResponseBody> => {
    const res = await axios.post('/api/auth/login/2fa', params)
    if (res.status !== 200) {
      console.error(res.data.error)
      throw new Error(res.data.error)
    }
    return res.data
  }
  return {
    verify
  }
}
