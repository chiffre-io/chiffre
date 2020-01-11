import { App } from '../types'
import { AuthenticatedRequest } from '../plugins/auth'
import { findVaultEdgesForUser } from '../db/models/entities/UserVaultEdges'
import {
  createProject,
  findAllProjectsInVault,
  findProject,
  deleteProject
} from '../db/models/entities/Projects'
import { formatEmitterEmbedScript } from '../emitterScript'
import {
  CreateProjectParameters,
  CreateProjectResponse,
  ProjectsList
} from './projects.schema'

// --

type PostRequest = AuthenticatedRequest<
  any,
  any,
  any,
  any,
  CreateProjectParameters
>

type UrlParams = {
  projectID: string
}

async function canUserAccessProject(_userID: string, _projectID: string) {
  // todo: Check vaultID against the userID keychain
  return true
}

export default async (app: App) => {
  /**
   * Create a new project
   */
  app.post<unknown, unknown, unknown, CreateProjectParameters>(
    '/projects',
    {
      preValidation: [app.authenticate()]
    },
    async (req: PostRequest, res) => {
      // todo: Make sure req.auth.userID has the right to create a project
      // ie: They have a link to the vaultID with their keychain.
      const project = await createProject(
        app.db,
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
    }
  )

  /**
   * Get all projects that the current logged in user has access to.
   */
  app.get(
    '/projects',
    {
      preValidation: [app.authenticate()]
    },
    async (req: AuthenticatedRequest, res) => {
      const userProjects: ProjectsList = []
      const vaultEdges = await findVaultEdgesForUser(app.db, req.auth.userID)
      for (const { vaultID, vaultKey } of vaultEdges) {
        const vaultProjects = await findAllProjectsInVault(app.db, vaultID)
        vaultProjects.forEach(project => {
          userProjects.push({ ...project, vaultKey })
        })
      }
      return res.send(userProjects)
    }
  )

  /**
   * Get a specific project by ID
   */
  app.get<unknown, UrlParams>(
    '/projects/:projectID',
    {
      preValidation: [app.authenticate()]
    },
    async (req: AuthenticatedRequest<any, any, UrlParams>, res) => {
      const { projectID } = req.params
      if (!(await canUserAccessProject(req.auth.userID, projectID))) {
        throw app.httpErrors.forbidden(
          'You are not authorized to view this project'
        )
      }
      const project = await findProject(app.db, projectID)
      if (!project) {
        throw app.httpErrors.notFound('Project not found')
      }
      return res.send(project)
    }
  )

  /**
   * Delete a specific project
   */
  app.delete<unknown, UrlParams>(
    '/projects/:projectID',
    {
      preValidation: [app.authenticate()]
    },
    async (req: AuthenticatedRequest<any, any, UrlParams>, res) => {
      const { projectID } = req.params
      if (!(await canUserAccessProject(req.auth.userID, projectID))) {
        throw app.httpErrors.forbidden(
          'You are not authorized to delete this project'
        )
      }
      await deleteProject(app.db, projectID)
      return res.status(204).send(null)
    }
  )
}
