import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import database, { Db } from '~/src/server/middleware/database'
import { Request } from '~/src/server/types'
import { verifyTwoFactorToken } from '~/src/server/2fa'
import {
  findUser,
  findTwoFactorSettings
} from '~/src/server/db/models/auth/Users'
import { markTwoFactorVerifiedInSession } from '~/src/server/db/models/auth/Sessions'
import { AuthClaims } from '~/src/shared/auth'
import { apiAuthMiddleware, ApiAuth } from '~/src/server/middleware/apiAuth'

export interface Login2FAParameters {
  twoFactorToken: string
}

export interface Login2FAResponseBody extends AuthClaims {
  masterSalt: string
}

// --

const handler = nextConnect()

handler.use(
  requireBodyParams<Login2FAParameters>({
    twoFactorToken: requiredString
  })
)
handler.use(database)
handler.use(apiAuthMiddleware(true))

handler.post(
  async (
    req: Request<Db & ApiAuth, Login2FAParameters>,
    res: NextApiResponse
  ) => {
    const { twoFactorToken } = req.body

    const user = await findUser(req.db, req.auth.userID)
    if (!user) {
      return res.status(404).json({
        error: `User not found`
      })
    }

    const twoFactorSettings = await findTwoFactorSettings(
      req.db,
      req.auth.userID
    )
    if (
      !twoFactorSettings.enabled ||
      !twoFactorSettings.verified ||
      !twoFactorSettings.secret
    ) {
      // Don't give too much information
      return res.status(422).json({
        error: `Cannot proceed with 2FA authentication`
      })
    }

    const verified = verifyTwoFactorToken(
      twoFactorToken,
      twoFactorSettings.secret
    )
    if (!verified) {
      return res.status(401).json({
        error: `Invalid two-factor code`
      })
    }

    try {
      await markTwoFactorVerifiedInSession(req.db, req.auth.sessionID)

      const body: Login2FAResponseBody = {
        ...req.auth,
        masterSalt: user.masterSalt
      }
      res.json(body)
    } catch (error) {
      return res.status(401).json({
        error: `Authentication error`,
        details: error.message
      })
    }
  }
)

// todo: Factor better error handlers & logging story
handler.use((err, req, res, next) => {
  console.error(err)
})

export default handler
