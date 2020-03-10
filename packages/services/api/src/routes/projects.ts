import { App } from '../types'
import { AuthenticatedRequest } from '../plugins/auth'
import { logEvent, EventTypes } from '../db/models/business/Events'
import {
  findVaultEdgesForUser,
  findUserVaultEdge
} from '../db/models/entities/UserVaultEdges'
import {
  createProject,
  findAllProjectsInVault,
  findProject,
  deleteProject,
  ProjectInput
} from '../db/models/entities/Projects'
import {
  CreateProjectParameters,
  CreateProjectResponse,
  Project,
  projectsSchema,
  createProjectParametersSchema,
  createProjectResponseSchema,
  projectSchema,
  projectURLParamsSchema,
  ProjectURLParams
} from './projects.schema'
import { getProjectKey, KeyIDs, ProjectConfig } from '@chiffre/push'
import { Plans } from '../exports/defs'

// --

type PostRequest = AuthenticatedRequest<
  any,
  any,
  any,
  any,
  CreateProjectParameters
>

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
      preValidation: [app.authenticate()],
      schema: {
        body: createProjectParametersSchema,
        response: {
          201: createProjectResponseSchema
        }
      }
    },
    async (req: PostRequest, res) => {
      // todo: Make sure req.auth.userID has the right to create a project
      // ie: They have a link to the vaultID with their keychain.
      const input: ProjectInput = {
        name: req.body.name,
        url: req.body.url,
        description: req.body.description,
        vaultID: req.body.vaultID,
        publicKey: req.body.publicKey,
        secretKey: req.body.secretKey
      }
      const project = await createProject(app.db, input)

      const projectConfig: ProjectConfig = {
        origins: [input.url]
      }
      await app.redis.ingressData.set(
        getProjectKey(project.id, KeyIDs.config),
        JSON.stringify(projectConfig)
      )
      const response: CreateProjectResponse = {
        projectID: project.id
      }
      await logEvent(app.db, EventTypes.projectCreated, req, {
        projectID: project.id
      })
      return res.status(201).send(response)
    }
  )

  /**
   * Get all projects that the current logged in user has access to.
   */
  app.get(
    '/projects',
    {
      preValidation: [app.authenticate()],
      schema: {
        response: {
          200: projectsSchema
        }
      }
    },
    async (req: AuthenticatedRequest, res) => {
      const userProjects: Project[] = []
      const vaultEdges = await findVaultEdgesForUser(app.db, req.auth.userID)
      for (const { vaultID, vaultKey } of vaultEdges) {
        const vaultProjects = await findAllProjectsInVault(app.db, vaultID)
        for (const project of vaultProjects) {
          userProjects.push({
            id: project.id,
            url: project.url,
            name: project.name,
            description: project.description,
            keys: {
              public: project.publicKey,
              secret: project.secretKey
            },
            vaultID,
            vaultKey: vaultKey
          })
        }
      }
      return res.send(userProjects)
    }
  )

  /**
   * Get a specific project by ID
   */
  app.get<unknown, ProjectURLParams>(
    '/projects/:projectID',
    {
      preValidation: [app.authenticate()],
      schema: {
        params: projectURLParamsSchema,
        response: {
          200: projectSchema
        }
      }
    },
    async (req: AuthenticatedRequest<any, any, ProjectURLParams>, res) => {
      const { projectID } = req.params
      const edge = await findUserVaultEdge(app.db, req.auth.userID, projectID)
      if (!edge) {
        throw app.httpErrors.notFound('Project not found')
      }
      const project = await findProject(app.db, projectID)
      if (!project) {
        throw app.httpErrors.notFound('Project not found')
      }
      const response: Project = {
        id: project.id,
        url: project.url,
        name: project.name,
        description: project.description,
        keys: {
          public: project.publicKey,
          secret: project.secretKey
        },
        vaultID: edge.vaultID,
        vaultKey: edge.vaultKey
      }
      return res.send(response)
    }
  )

  /**
   * Delete a specific project
   */
  app.delete<unknown, ProjectURLParams>(
    '/projects/:projectID',
    {
      preValidation: [app.authenticate()],
      schema: {
        params: projectURLParamsSchema
      }
    },
    async (req: AuthenticatedRequest<any, any, ProjectURLParams>, res) => {
      const { projectID } = req.params
      if (!(await canUserAccessProject(req.auth.userID, projectID))) {
        throw app.httpErrors.forbidden(
          'You are not authorized to delete this project'
        )
      }
      await deleteProject(app.db, projectID)
      return res.status(204).send()
    }
  )
}
