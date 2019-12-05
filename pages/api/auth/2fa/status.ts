import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import { Request } from '~/src/server/types'
import { findTwoFactorSettings } from '~/src/server/db/models/auth/UsersAuthSettings'

// --

export enum TwoFactorStatus {
  disabled = 'disabled',
  pending = 'pending',
  verified = 'verified'
}

export interface TwoFactorStatusResponse {
  status: TwoFactorStatus
}

const handler = nextConnect()

handler.use(database)
handler.use(apiAuthMiddleware)

handler.get(async (req: Request<Db & ApiAuth>, res: NextApiResponse) => {
  const settings = await findTwoFactorSettings(req.db, req.auth.userID)
  if (!settings) {
    return res.status(404).json({
      error: 'Two-factor settings not found',
      details: `User ID: ${req.auth.userID}`
    })
  }
  const body: TwoFactorStatusResponse = {
    status: settings.verified
      ? TwoFactorStatus.verified
      : settings.enabled
      ? TwoFactorStatus.pending
      : TwoFactorStatus.disabled
  }
  return res.json(body)
})

export default handler
