import { NextApiMiddleware } from '~/src/server/types'
import { Db } from './database'
import { verifyJwt, JwtClaims } from '~/src/server/jwt'
import { isSessionValid } from '~/src/server/db/models/auth/Sessions'

export interface ApiAuth {
  auth: JwtClaims
}

export const apiAuthMiddleware: NextApiMiddleware<Db & ApiAuth> = async (
  req,
  res,
  next
) => {
  try {
    const bearerLength = 'Bearer '.length
    if (
      !req.headers.authorization ||
      req.headers.authorization.length <= bearerLength
    ) {
      throw new Error('Missing JWT in authorization header')
    }
    const token = req.headers.authorization.slice(bearerLength)
    const claims = verifyJwt(token)
    if (!(await isSessionValid(req.db, claims.sessionID, claims.userID))) {
      throw new Error('Session has expired')
    }
    req.auth = claims
    next()
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication required',
      details: error.message
    })
  }
}
