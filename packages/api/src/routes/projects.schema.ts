import S from 'fluent-schema'
import { Project } from '../db/models/entities/Projects'

export interface CreateProjectParameters {
  vaultID: string
  publicKey: string
  secretKey: string
}

export const createProjectParametersSchema = S.object()
  .prop('vaultID', S.string().required())
  .prop('publicKey', S.string().required())
  .prop('secretKey', S.string().required())

// --

type ProjectWithVaultKey = Project & { vaultKey: string }
export type ProjectsList = ProjectWithVaultKey[]

// --

export interface CreateProjectResponse {
  projectID: string
  embedScript: string
}
