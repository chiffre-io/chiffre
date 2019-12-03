import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import database, { Db } from '~/src/server/middleware/database'
import { Request } from '~/src/server/types'
import { verifyTwoFactorToken } from '~/src/server/2fa'
import { findUser } from '~/src/server/db/models/auth/UsersAuthSRP'
import { findSession } from '~/src/server/db/models/auth/Sessions'
import { createJwt } from '~/src/server/jwt'
import { markTwoFactorVerifiedInSession } from '~/src/server/db/models/auth/Sessions'
import { getTwoFactorSettings } from '~/src/server/db/models/auth/UsersAuthSettings'

export interface Login2FAParameters {
  userID: string
  sessionID: string
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
    sessionID: requiredString,
    twoFactorToken: requiredString
  })
)
handler.use(database)

handler.post(
  async (req: Request<Db, Login2FAParameters>, res: NextApiResponse) => {
    const { userID, sessionID, twoFactorToken } = req.body

    const user = await findUser(req.db, userID)
    if (!user) {
      return res.status(404).json({
        error: `User not found`
      })
    }
    const session = await findSession(req.db, sessionID)
    if (!session) {
      return res.status(404).json({
        error: `Session not found`
      })
    }

    if (session.twoFactorVerified) {
      // The session is already verified
      // todo: Then what ?
    }

    const twoFactorSettings = await getTwoFactorSettings(req.db, user.id)
    if (
      !twoFactorSettings.twoFactorEnabled ||
      !twoFactorSettings.twoFactorVerified ||
      !twoFactorSettings.twoFactorSecret
    ) {
      // Don't give too much information
      return res.status(422).json({
        error: `Cannot proceed with 2FA authentication`
      })
    }

    const verified = verifyTwoFactorToken(
      twoFactorToken,
      twoFactorSettings.twoFactorSecret
    )
    if (!verified) {
      return res.status(401).json({
        error: `Invalid two-factor code`
      })
    }

    await markTwoFactorVerifiedInSession(req.db, session.id)

    const jwt = createJwt({
      userID: user.id,
      sessionID: session.id,
      sessionExpiresAt: session.expiresAt
    })

    // todo: Set JWT cookie

    const body: Login2FAResponseBody = {
      jwt
    }
    res.json(body)
  }
)

// todo: Factor better error handlers & logging story
handler.use((err, req, res, next) => {
  console.error(err)
})

export default handler
