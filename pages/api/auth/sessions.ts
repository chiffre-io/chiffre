import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import { Request } from '~/src/server/types'
import {
  getAllSessionsForUser,
  isSessionExpired
} from '~/src/server/db/models/auth/Sessions'
import { getTwoFactorSettings } from '~/src/server/db/models/auth/UsersAuthSettings'

// --

const handler = nextConnect()

handler.use(database)
handler.use(apiAuthMiddleware)

export interface SessionInfo {
  id: string
  active: boolean
  current: boolean
  twoFactor: 'disabled' | 'pending' | 'verified'
  createdAt: Date
  ipAddress: string
}

/**
 * List all the sessions the current logged in user has
 */
handler.get(async (req: Request<Db & ApiAuth>, res: NextApiResponse) => {
  try {
    const sessions = await getAllSessionsForUser(req.db, req.auth.userID)
    const info: SessionInfo[] = []
    for (const session of sessions) {
      if (session.userID !== req.auth.userID) {
        // Should not happen unless major SQL cockup in getAllSessionsForUser
        continue
      }
      const active = !isSessionExpired(session)
      const twoFactorSettings = await getTwoFactorSettings(
        req.db,
        req.auth.userID
      )
      info.push({
        id: session.id,
        active,
        current: session.id === req.auth.sessionID,
        twoFactor: twoFactorSettings.verified
          ? session.twoFactorVerified
            ? 'verified'
            : 'pending'
          : 'disabled',
        ipAddress: session.ipAddress,
        createdAt: session.created_at
      })
    }
    return res.json(info)
  } catch (error) {
    // todo: Better error handling
    return res.status(500).json({
      error: 'Cannot list sessions',
      details: error.message
    })
  }
})

export default handler
