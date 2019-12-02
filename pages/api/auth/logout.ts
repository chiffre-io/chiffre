import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import { Request } from '~/src/server/types'
import { deleteSession } from '~/src/server/db/models/auth/Sessions'

// --

const handler = nextConnect()

handler.use(database)
handler.use(apiAuthMiddleware)

handler.post(async (req: Request<Db & ApiAuth>, res: NextApiResponse) => {
  try {
    // todo: Handle deauth attacks (req.auth.userID !== session.userID)
    await deleteSession(req.db, req.auth.sessionID, req.auth.userID)
    return res
      .status(204) // No Content
      .send(null)
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to log out',
      details: error.message
    })
  }
})

export default handler
