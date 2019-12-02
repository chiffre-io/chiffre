import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import { Request } from '~/src/server/types'
import { createProject } from '~/src/server/db/models/projects/Projects'

// --

export interface CreateProjectArgs {
  publicKey: string
  encrypted: string
}

export interface CreateProjectResponse {
  projectID: string
}

const handler = nextConnect()

handler.use(
  requireBodyParams<CreateProjectArgs>({
    publicKey: requiredString,
    encrypted: requiredString
  })
)
handler.use(database)
handler.use(apiAuthMiddleware)

handler.post(
  async (
    req: Request<Db & ApiAuth, CreateProjectArgs>,
    res: NextApiResponse
  ) => {
    console.log('hello')
    try {
      const { id } = await createProject(
        req.db,
        req.auth.userID,
        req.body.publicKey,
        req.body.encrypted
      )
      const response: CreateProjectResponse = {
        projectID: id
      }
      return res.status(201).send(response)
    } catch (error) {
      return res.status(401).json({
        error: 'Failed to create project',
        details: error.message
      })
    }
  }
)

export default handler
