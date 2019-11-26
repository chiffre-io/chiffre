import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import requireBodyParams, {
  requiredString,
  RequestWithBody
} from '~/src/server/middleware/requireBodyParams'

export interface Login2FAParameters {
  userID: string
  twoFactorToken: string
}

export interface Login2FAResponseBody {
  jwt: string
}

// --

const handler = nextConnect()

handler.use(
  requireBodyParams<Login2FAParameters>({
    userID: requiredString,
    twoFactorToken: requiredString
  })
)

handler.post(
  (req: RequestWithBody<Login2FAParameters>, res: NextApiResponse) => {
    const { userID, twoFactorToken } = req.body

    const body: Login2FAResponseBody = {
      jwt: 'jwt'
    }
    res.json(body)
  }
)

export default handler
