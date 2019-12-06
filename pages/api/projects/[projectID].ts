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
  deleteProject
} from '~/src/server/db/models/entities/Projects'
import extractUrlParameter, {
  UrlParams
} from '~/src/server/middleware/extractUrlParameter'

// --

const canUserAccessProject = async (userID: string, projectID: string) => {
  // todo: Check vaultID against the userID keychain
  return true
}

// --

const handler = nextConnect()

interface UrlParameters {
  projectID: string
}

handler.use(database)
handler.use(apiAuthMiddleware)
handler.use(extractUrlParameter<UrlParams<UrlParameters>>('projectID'))

handler.get(
  async (
    req: Request<Db & ApiAuth & UrlParams<UrlParameters>>,
    res: NextApiResponse
  ) => {
    const { projectID } = req.params
    if (!(await canUserAccessProject(req.auth.userID, projectID))) {
      return res.status(401).json({
        error: 'Unauthorized',
        details: 'You are not allowed to view this project'
      })
    }
    const project = await findProject(req.db, projectID)
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        details: `Project ID: ${projectID}`
      })
    }
    return res.json(project)
  }
)

// -----------------------------------------------------------------------------

handler.delete(
  async (
    req: Request<Db & ApiAuth & UrlParams<UrlParameters>>,
    res: NextApiResponse
  ) => {
    const { projectID } = req.params
    if (!(await canUserAccessProject(req.auth.userID, projectID))) {
      return res.status(401).json({
        error: 'Unauthorized',
        details: 'You are not allowed to delete this project'
      })
    }
    try {
      await deleteProject(req.db, projectID)
      return res.status(204).send(null)
    } catch (error) {
      console.error(error)
      return res.status(401).json({
        error: 'Unauthorized',
        details: 'You are not allowed to delete this project'
      })
    }
  }
)

export default handler
