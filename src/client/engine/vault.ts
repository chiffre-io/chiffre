import {
  CloakKey,
  CloakedString,
  encryptString,
  decryptString
} from './crypto/cloak'

export interface ProjectKey {
  projectID: string
  key: CloakKey
}

export interface Vault {
  v: number
  name: string
  projectKeys: ProjectKey[]
}

// --

export const createVault = (name: string): Vault => {
  return {
    v: 1,
    name,
    projectKeys: []
  }
}

// --

export const lockVault = async (
  vault: Vault,
  key: CloakKey
): Promise<CloakedString> => {
  const json = JSON.stringify(vault)
  return await encryptString(json, key)
}

export const unlockVault = async (
  vault: CloakedString,
  key: CloakKey
): Promise<Vault> => {
  const json = await decryptString(vault, key)
  return JSON.parse(json)
}

// --

export const addProject = (
  vault: Vault,
  projectID: string,
  projectKey: CloakKey
): Vault => {
  vault.projectKeys.push({ projectID, key: projectKey })
  return vault
}

export const getProjectKey = (vault: Vault, projectID: string) => {
  const project = vault.projectKeys.find(pk => pk.projectID === projectID)
  return project ? project.key : null
}
