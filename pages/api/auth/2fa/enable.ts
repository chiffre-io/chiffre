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
  enableTwoFactor,
  cancelTwoFactor
} from '~/src/server/db/models/auth/UsersAuthSettings'
import {
  generateTwoFactorSecret,
  formatTwoFactorSecret
} from '~/src/server/2fa'
import { findUser } from '~/src/server/db/models/auth/UsersAuthSRP'

// --

export interface TwoFactorEnableResponse {
  text: string
  uri: string
}

const handler = nextConnect()

handler.use(database)
handler.use(apiAuthMiddleware)

/**
 * Enable 2FA (needs to be verified with ./verify)
 */
handler.post(async (req: Request<Db & ApiAuth>, res: NextApiResponse) => {
  // todo: Handle this case
  // console.dir(req.auth)
  // const settings = await getTwoFactorSettings(req.db, req.auth.userID)
  // console.dir(settings)
  // if (
  //   settings.twoFactorEnabled ||
  //   settings.twoFactorVerified ||
  //   settings.twoFactorSecret
  // ) {
  //   return res.status(422).json({
  //     error: 'Two-factor authentication is already active'
  //   })
  // }
  try {
    const user = await findUser(req.db, req.auth.userID)
    if (!user) {
      throw new Error('User not found')
    }
    const secret = generateTwoFactorSecret()
    await enableTwoFactor(req.db, req.auth.userID, secret)
    const body: TwoFactorEnableResponse = formatTwoFactorSecret(
      secret,
      user.username
    )
    return res.json(body)
  } catch (error) {
    return res.status(422).json({
      error: 'Failed to activate two-factor authentication',
      details: error.message
    })
  }
})

/**
 * Cancel a pending request to enable 2FA.
 * Will fail if 2FA has been verified, call ./disable instead
 */
handler.delete(async (req: Request<Db & ApiAuth>, res: NextApiResponse) => {
  const twoFactorSettings = await getTwoFactorSettings(req.db, req.auth.userID)
  if (!twoFactorSettings) {
    return res.status(404).json({
      error: 'Two-factor settings not found',
      details: `User ID: ${req.auth.userID}`
    })
  }
  if (!twoFactorSettings.enabled) {
    return res.status(422).json({
      error: 'Two-factor authentication is not active for this account',
      details: `User ID: ${req.auth.userID}`
    })
  }
  if (twoFactorSettings.verified) {
    return res.status(401).json({
      error: 'Cannot cancel verified two-factor authentication',
      details: `User ID: ${req.auth.userID}`
    })
  }
  try {
    await cancelTwoFactor(req.db, req.auth.userID)
    return res.status(204).send(null)
  } catch (error) {
    return res.status(401).json({
      error: 'Failed to cancel two-factor authentication',
      details: error.message
    })
  }
})

export default handler
