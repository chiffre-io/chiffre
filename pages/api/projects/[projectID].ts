import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import { Request } from '~/src/server/types'
import {
  findProject,
  updateProject,
  deleteProject
} from '~/src/server/db/models/projects/Projects'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'

// --

const handler = nextConnect()

handler.use(database)
handler.use(apiAuthMiddleware)

const getProjectID = (req: Request<Db & ApiAuth>): string => {
  const { projectID } = req.query
  if (!projectID) {
    return null
  }
  return typeof projectID === 'string' ? projectID : projectID[0]
}

handler.get(async (req: Request<Db & ApiAuth>, res: NextApiResponse) => {
  const projectID = getProjectID(req)

  const project = await findProject(req.db, projectID)
  if (!project) {
    return res.status(404).json({
      error: 'Project not found',
      details: `Project ID: ${projectID}`
    })
  }
  if (project.creator !== req.auth.userID) {
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'You are not allowed to view this project'
    })
  }

  return res.json(project)
})

// -----------------------------------------------------------------------------

export interface UpdateProjectParams {
  encrypted: string // Always required
  publicKey?: string // Can be updated
}

handler.patch(
  requireBodyParams<UpdateProjectParams>({
    encrypted: requiredString
  }),
  async (
    req: Request<Db & ApiAuth, UpdateProjectParams>,
    res: NextApiResponse
  ) => {
    try {
      const projectID = getProjectID(req)
      await updateProject(
        req.db,
        projectID,
        req.auth.userID,
        req.body.encrypted,
        !!req.body.publicKey ? req.body.publicKey : undefined
      )
      return res.status(204).send(null)
    } catch (error) {
      console.error(error)
      return res.status(401).json({
        error: 'Unauthorized',
        details: 'You are not allowed to edit this project'
      })
    }
  }
)

// -----------------------------------------------------------------------------

handler.delete(async (req: Request<Db & ApiAuth>, res: NextApiResponse) => {
  try {
    const projectID = getProjectID(req)
    await deleteProject(req.db, projectID, req.auth.userID)
    return res.status(204).send(null)
  } catch (error) {
    console.error(error)
    return res.status(401).json({
      error: 'Unauthorized',
      details: 'You are not allowed to delete this project'
    })
  }
})

export default handler
