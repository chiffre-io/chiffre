import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import { Request } from '~/src/server/types'
import {
  findTwoFactorSettings,
  markTwoFactorVerified
} from '~/src/server/db/models/auth/Users'
import { verifyTwoFactorToken, generateBackupCodes } from '~/src/server/2fa'
import { markTwoFactorVerifiedInSession } from '~/src/server/db/models/auth/Sessions'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'

// --

export interface VerifyTwoFactorParams {
  token: string
}

export interface VerifyTwoFactorResponse {
  backupCodes: string[]
}

type VerifyTwoFactorRequest = Request<Db & ApiAuth, VerifyTwoFactorParams>

// --

const handler = nextConnect()

handler.use(database)
handler.use(apiAuthMiddleware)
handler.use(
  requireBodyParams<VerifyTwoFactorParams>({
    token: requiredString
  })
)

handler.post(async (req: VerifyTwoFactorRequest, res: NextApiResponse) => {
  const twoFactorSettings = await findTwoFactorSettings(req.db, req.auth.userID)
  if (twoFactorSettings.verified) {
    return res.status(422).json({
      error: 'Two-factor authentication is already active'
    })
  }

  const verified = verifyTwoFactorToken(
    req.body.token,
    twoFactorSettings.secret
  )
  if (!verified) {
    return res.status(401).json({
      error: `Invalid two-factor code`
    })
  }

  try {
    // Generate 8 codes of 128 bits, hex-encoded
    const backupCodes = generateBackupCodes(8, 16)
    await markTwoFactorVerified(req.db, req.auth.userID, backupCodes)
    await markTwoFactorVerifiedInSession(req.db, req.auth.sessionID)
    const body: VerifyTwoFactorResponse = {
      backupCodes
    }
    return res.json(body)
  } catch (error) {
    return res.status(401).json({
      error: 'Failed to verify two-factor authentication',
      details: error.message
    })
  }
})

export default handler
