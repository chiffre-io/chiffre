import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import { Request } from '~/src/server/types'
import {
  getTwoFactorSettings,
  enableTwoFactor
} from '~/src/server/db/models/auth/UsersAuthSettings'
import { generateTwoFactorSecret } from '~/src/server/2fa'
import { formatTwoFactorSecret } from '../../../../src/server/2fa'
import { findUser } from '~/src/server/db/models/auth/UsersAuthSRP'

// --

export interface TwoFactorActivationResponse {
  twoFactorSecret: {
    text: string
    uri: string
  }
}

const handler = nextConnect()

handler.use(database)
handler.use(apiAuthMiddleware)

handler.post(async (req: Request<Db & ApiAuth>, res: NextApiResponse) => {
  console.dir(req.auth)
  const settings = await getTwoFactorSettings(req.db, req.auth.userID)
  console.dir(settings)
  if (
    settings.twoFactorEnabled ||
    settings.twoFactorVerified ||
    settings.twoFactorSecret
  ) {
    // return res.status(422).json({
    //   error: 'Two-factor authentication is already active'
    // })
  }
  try {
    const user = await findUser(req.db, req.auth.userID)
    if (!user) {
      throw new Error('User not found')
    }
    const secret = generateTwoFactorSecret()
    await enableTwoFactor(req.db, req.auth.userID, secret)
    const body: TwoFactorActivationResponse = {
      twoFactorSecret: formatTwoFactorSecret(secret, user.username)
    }
    return res.json(body)
  } catch (error) {
    return res.status(422).json({
      error: 'Failed to activate Two Factor Authentication',
      details: error.message
    })
  }
})

export default handler
