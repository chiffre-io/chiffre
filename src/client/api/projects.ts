import nacl from 'tweetnacl'
import { CloakKey, encryptString, decryptString } from '@47ng/cloak'
import { clientApi } from '../api'
import {
  CreateProjectArgs,
  CreateProjectResponse
} from '~/pages/api/projects/index'
import { b64 } from '../engine/crypto/primitives/codec'
import { Project } from '~/src/server/db/models/entities/Projects'

export const createProject = async (
  vaultID: string,
  vaultKey: CloakKey
): Promise<CreateProjectResponse> => {
  const keyPair = nacl.box.keyPair()
  const publicKey = b64.encode(keyPair.publicKey)
  const secretKey = b64.encode(keyPair.secretKey)
  const body: CreateProjectArgs = {
    vaultID,
    publicKey,
    secretKey: await encryptString(secretKey, vaultKey)
  }
  type Req = CreateProjectArgs
  type Res = CreateProjectResponse
  return await clientApi.post<Req, Res>('/projects', body)
}

export const getProject = async (
  projectID: string,
  vaultKey: CloakKey
): Promise<Project> => {
  const url = `/projects/${projectID}`
  const project = await clientApi.get<Project>(url)
  return {
    ...project,
    secretKey: await decryptString(project.secretKey, vaultKey)
  }
}
