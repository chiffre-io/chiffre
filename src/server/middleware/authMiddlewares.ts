import { NextApiMiddleware } from '../types'
import { Db } from './database'
import { verifyJwt } from '../jwt'
import { isSessionValid } from '../db/models/auth/Sessions'

export interface ApiAuth {
  auth: {
    userID: string
    sessionID: string
    sessionExpiresAt: Date
  }
}

export const apiAuthMiddleware: NextApiMiddleware<Db & ApiAuth> = async (
  req,
  res,
  next
) => {
  const bearerLength = 'Bearer '.length

  if (
    !req.headers.authorization ||
    req.headers.authorization.length <= bearerLength
  ) {
    return res.status(401).json({
      error: 'Authentication required',
      details: 'Missing JWT in authorization header'
    })
  }
  try {
    const token = req.headers.authorization.slice(bearerLength)
    const { userID, sessionID, expiresAt } = verifyJwt(token)
    if (!(await isSessionValid(req.db, sessionID, userID))) {
      throw new Error('Session has expired')
    }
    req.auth = {
      userID,
      sessionID,
      sessionExpiresAt: expiresAt
    }
    next()
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication required',
      details: error.message
    })
  }
}
