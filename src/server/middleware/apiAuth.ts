import { NextApiMiddleware } from '~/src/server/types'
import { Db } from './database'
import { AuthClaims } from '~/src/shared/auth'
import { isSessionValid } from '~/src/server/db/models/auth/Sessions'
import { CookieNames } from '~/src/server/cookies'

export interface ApiAuth {
  auth: AuthClaims
}

export const apiAuthMiddleware = (
  skipTwoFactorCheck = false
): NextApiMiddleware<Db & ApiAuth> => async (req, res, next) => {
  try {
    const sessionID = req.cookies[CookieNames.sid]
    console.dir({ sessionID })
    const session = await isSessionValid(req.db, sessionID, skipTwoFactorCheck)
    if (!session) {
      throw new Error('Session has expired')
    }
    req.auth = {
      userID: session.userID,
      sessionID: session.id,
      sessionExpiresAt: session.expiresAt
    }
    next()
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication required',
      details: error.message
    })
  }
}
