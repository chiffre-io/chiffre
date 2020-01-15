import S from 'fluent-schema'
import { Project as LockedProject } from '@chiffre/crypto'

export interface CreateProjectParameters {
  vaultID: string
  publicKey: string
  secretKey: string
}

export const createProjectParametersSchema = S.object()
  .prop('vaultID', S.string().required())
  .prop('publicKey', S.string().required())
  .prop('secretKey', S.string().required())

export interface CreateProjectResponse {
  projectID: string
  embedScript: string
}

export const createProjectResponseSchema = S.object()
  .prop('projectID', S.string())
  .prop('embedScript', S.string())

// --

export interface ProjectURLParams {
  projectID: string
}

export const projectURLParamsSchema = S.object().prop('projectID', S.string())

// --

export interface Project extends LockedProject {
  id: string
  vaultID: string
  vaultKey: string
  embedScript: string
}

export const projectSchema = S.object()
  .prop('id', S.string())
  .prop('vaultID', S.string())
  .prop('vaultKey', S.string())
  .prop('embedScript', S.string())
  .prop(
    'keys',
    S.object()
      .prop('public', S.string())
      .prop('secret', S.string())
  )

export const projectsSchema = S.array().items(projectSchema)
