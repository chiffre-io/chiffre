import S from 'fluent-schema'
import { Project as LockedProject } from '@chiffre/crypto-client'

export interface CreateProjectParameters {
  name: string
  vaultID: string
  publicKey: string
  secretKey: string
  url: string
  description?: string
}

export const createProjectParametersSchema = S.object()
  .prop('name', S.string().required())
  .prop('vaultID', S.string().required())
  .prop('publicKey', S.string().required())
  .prop('secretKey', S.string().required())
  .prop('url', S.string())
  .prop('description', S.string())

export interface CreateProjectResponse {
  projectID: string
}

export const createProjectResponseSchema = S.object().prop(
  'projectID',
  S.string()
)

// --

export interface ProjectURLParams {
  projectID: string
}

export const projectURLParamsSchema = S.object().prop('projectID', S.string())

// --

export interface Project extends LockedProject {
  id: string
  url: string
  name: string
  vaultID: string
  vaultKey: string
  description?: string
}

export const projectSchema = S.object()
  .prop('id', S.string())
  .prop('url', S.string())
  .prop('name', S.string())
  .prop('vaultID', S.string())
  .prop('vaultKey', S.string())
  .prop('description', S.string())
  .prop(
    'keys',
    S.object()
      .prop('public', S.string())
      .prop('secret', S.string())
  )

export const projectsSchema = S.array().items(projectSchema)
