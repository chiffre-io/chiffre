import nacl from 'tweetnacl'
import { b64 } from './crypto/primitives/codec'

type KVPair = {
  [key: string]: any
}

export interface Project<Pub = KVPair, Sec = KVPair> {
  v: number
  keys: nacl.BoxKeyPair
  public: Pub
  secret: Sec & {
    name: string
    description?: string
  }
}

// -----------------------------------------------------------------------------

export const createProject = (name: string, description?: string): Project => {
  return {
    v: 1,
    keys: nacl.box.keyPair(),
    public: {},
    secret: {
      name,
      description
    }
  }
}

export const getProjectPublicData = (project: Project): string => {
  return b64.encode(project.keys.publicKey)
}
