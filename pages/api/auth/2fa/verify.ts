import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import { Request } from '~/src/server/types'
import { getTwoFactorSettings } from '~/src/server/db/models/auth/UsersAuthSettings'
import { verifyTwoFactorToken, generateBackupCodes } from '~/src/server/2fa'

// --

export interface VerifyTwoFactorParams {
  twoFactorToken: string
}

export interface VerifyTwoFactorResponse {
  backupCodes: string[]
}

type VerifyTwoFactorRequest = Request<Db & ApiAuth, VerifyTwoFactorParams>

// --

const handler = nextConnect()

handler.use(database)
handler.use(apiAuthMiddleware)

handler.post(async (req: VerifyTwoFactorRequest, res: NextApiResponse) => {
  const settings = await getTwoFactorSettings(req.db, req.auth.userID)
  if (settings.twoFactorVerified) {
    return res.status(422).json({
      error: 'Two-factor authentication is already active'
    })
  }

  const verified = verifyTwoFactorToken(
    req.body.twoFactorToken,
    settings.twoFactorSecret
  )
  if (!verified) {
    return res.status(401).json({
      error: `Invalid two factor code`
    })
  }

  // Generate 8 codes of 128 bits, hex-encoded
  const backupCodes = generateBackupCodes(8, 16)
  // todo: Store them in the database
  const body: VerifyTwoFactorResponse = {
    backupCodes
  }
  return res.json(body)
})

export default handler
