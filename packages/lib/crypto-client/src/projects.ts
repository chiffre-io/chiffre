import { CloakKey, encryptString, decryptString } from '@47ng/cloak'
import { CryptoBoxKeys, generateKeys } from '@chiffre/crypto-box'

export interface Project {
  keys: {
    public: string
    secret: string
  }
}

export interface UnlockedProject extends Readonly<CryptoBoxKeys> {}

export async function createProject(): Promise<UnlockedProject> {
  return generateKeys()
}

// --

export async function lockProject(
  project: UnlockedProject,
  vaultKey: CloakKey
): Promise<Project> {
  return {
    keys: {
      public: project.public,
      secret: await encryptString(project.secret, vaultKey)
    }
  }
}

export async function unlockProject(
  project: Project,
  vaultKey: CloakKey
): Promise<UnlockedProject> {
  return generateKeys(await decryptString(project.keys.secret, vaultKey))
}
