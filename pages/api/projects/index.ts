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
import { createProject } from '~/src/server/db/models/entities/Projects'
import { formatEmitterEmbedScript } from '~/src/server/emitterScript'

// --

export interface CreateProjectArgs {
  vaultID: string
  publicKey: string
  secretKey: string
}

export interface CreateProjectResponse {
  projectID: string
  embedScript: string
}

const handler = nextConnect()

handler.use(
  requireBodyParams<CreateProjectArgs>({
    vaultID: requiredString,
    publicKey: requiredString,
    secretKey: requiredString
  })
)
handler.use(database)
handler.use(apiAuthMiddleware)

handler.post(
  async (
    req: Request<Db & ApiAuth, CreateProjectArgs>,
    res: NextApiResponse
  ) => {
    try {
      // todo: Make sure req.auth.userID has the right to create a project
      // ie: They have a link to the vaultID with their keychain.
      const { id: projectID } = await createProject(
        req.db,
        req.body.vaultID,
        req.body.publicKey,
        req.body.secretKey
      )
      const embedScript = await formatEmitterEmbedScript(req.db, projectID)
      const response: CreateProjectResponse = {
        projectID,
        embedScript
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
