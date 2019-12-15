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
import {
  Project,
  createProject,
  findAllProjectsInVault
} from '~/src/server/db/models/entities/Projects'
import { formatEmitterEmbedScript } from '~/src/server/emitterScript'
import { findVaultEdgesForUser } from '~/src/server/db/models/entities/UserVaultEdges'

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

handler.use(database)
handler.use(apiAuthMiddleware)

handler.post(
  requireBodyParams<CreateProjectArgs>({
    vaultID: requiredString,
    publicKey: requiredString,
    secretKey: requiredString
  }),
  async (
    req: Request<Db & ApiAuth, CreateProjectArgs>,
    res: NextApiResponse
  ) => {
    try {
      // todo: Make sure req.auth.userID has the right to create a project
      // ie: They have a link to the vaultID with their keychain.
      const project = await createProject(
        req.db,
        req.body.vaultID,
        req.body.publicKey,
        req.body.secretKey
      )
      const embedScript = await formatEmitterEmbedScript(project)
      const response: CreateProjectResponse = {
        projectID: project.id,
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

// -----------------------------------------------------------------------------

export type ProjectsList = ProjectWithVaultKey[]
type ProjectWithVaultKey = Project & { vaultKey: string }

handler.get(async (req: Request<Db & ApiAuth>, res: NextApiResponse) => {
  try {
    const userProjects: ProjectWithVaultKey[] = []
    const vaultEdges = await findVaultEdgesForUser(req.db, req.auth.userID)
    for (const { vaultID, vaultKey } of vaultEdges) {
      const vaultProjects = await findAllProjectsInVault(req.db, vaultID)
      vaultProjects.forEach(project => {
        userProjects.push({ ...project, vaultKey })
      })
    }
    return res.json(userProjects)
  } catch (error) {
    console.error(error)
    return res.status(401).json({
      error: 'Cannot retrieve projects',
      details: error.message
    })
  }
})

export default handler
