import Knex from 'knex'
import { testUserCredentials } from './01-users'
import { formatEmitterEmbedScript } from '~/src/server/emitterScript'
import { createVault } from '~/src/server/db/models/entities/Vaults'
import {
  Project,
  PROJECTS_TABLE
} from '~/src/server/db/models/entities/Projects'
import { createUserVaultEdge } from '../models/entities/UserVaultEdges'
import {
  generateKey,
  encryptString,
  decryptString
} from '~/src/client/engine/crypto/cloak'
import { findUser } from '~/src/server/db/models/auth/UsersAuthSRP'
import { deriveMasterKey } from '~/src/client/engine/masterKey'
import { findKeychain } from '../models/entities/Keychains'

export const testProject = {
  projectID: 'c0ffeeb0-dead-f00d-baad-cafebaadcafe',
  key: 'QSBU_0eqn8fBlRuZYuSqcFJe7cxqLTZ5-E5CJYW4Pwk=',
  publicKey: 'AAa5jWhVoFoxunJ_8RzvCT2DbaX1C6eRIo9YBhU7tUY=',
  secretKey: 'mZRAvkB8hZkFU6u_1aQC3GNd6AosZYQjVt0uTNHtnAo='
}

export const seed = async (knex: Knex) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }
  const { userID, username, password } = testUserCredentials

  // Step 1: create a vault
  const vaultKey = await generateKey()
  const vaultPayload = await encryptString('empty', vaultKey)
  const { id: vaultID } = await createVault(knex, vaultPayload, userID)

  // Step 2: create a project (put it in the vault)
  const { projectID, publicKey, secretKey } = testProject
  const project: Project = {
    id: projectID,
    publicKey,
    secretKey: await encryptString(secretKey, vaultKey),
    vaultID
  }
  try {
    await knex.insert(project).into(PROJECTS_TABLE)
  } catch (error) {
    console.error(error)
  }

  // Unlock the keychain to get the keychain key
  const { masterSalt } = await findUser(knex, userID)
  const masterKey = await deriveMasterKey(username, password, masterSalt)
  const { key: encryptedKeychainKey } = await findKeychain(knex, userID)
  const keychainKey = await decryptString(encryptedKeychainKey, masterKey)

  // Step 3: connect the vault to the keychain via an edge
  const encryptedVaultKey = await encryptString(vaultKey, keychainKey)
  await createUserVaultEdge(knex, userID, vaultID, encryptedVaultKey)

  const emitter = await formatEmitterEmbedScript(project)
  console.log(emitter)
}
