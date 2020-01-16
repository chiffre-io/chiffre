import nacl from 'tweetnacl'
import { CloakKey, encryptString, decryptString } from '@47ng/cloak'
import { b64 } from '@47ng/codec'

export interface Project {
  keys: {
    public: string
    secret: string
  }
}

export interface UnlockedProject {
  keyPair: nacl.BoxKeyPair
}

export function createProject(): UnlockedProject {
  return {
    keyPair: nacl.box.keyPair()
  }
}

// --

export async function lockProject(
  project: UnlockedProject,
  vaultKey: CloakKey
): Promise<Project> {
  return {
    keys: {
      public: b64.encode(project.keyPair.publicKey),
      secret: await encryptString(
        b64.encode(project.keyPair.secretKey),
        vaultKey
      )
    }
  }
}

export async function unlockProject(
  project: Project,
  vaultKey: CloakKey
): Promise<UnlockedProject> {
  return {
    keyPair: nacl.box.keyPair.fromSecretKey(
      b64.decode(await decryptString(project.keys.secret, vaultKey))
    )
  }
}
