import Knex from 'knex'
import dotenv from 'dotenv'
import { deriveMasterKey } from '@chiffre/crypto-client'
import { generateKey, encryptString, decryptString } from '@47ng/cloak'
import { testUserCredentials } from './01-users'
import { formatEmitterEmbedScript } from '../../emitterScript'
import { createVault } from '../models/entities/Vaults'
import { Project, PROJECTS_TABLE } from '../models/entities/Projects'
import { createUserVaultEdge } from '../models/entities/UserVaultEdges'
import { findUser } from '../models/auth/Users'
import { findKeychain } from '../models/entities/Keychains'

export const testProject = {
  projectID: 'testProjectID123',
  publicKey: 'pk.AAa5jWhVoFoxunJ_8RzvCT2DbaX1C6eRIo9YBhU7tUY',
  secretKey: 'sk.mZRAvkB8hZkFU6u_1aQC3GNd6AosZYQjVt0uTNHtnAo'
}

export const seed = async (knex: Knex) => {
  dotenv.config()
  if (process.env.NODE_ENV === 'production') {
    return
  }
  const { userID, username, password } = testUserCredentials

  // Step 1: create a vault
  const vaultKey = generateKey()
  const { id: vaultID } = await createVault(knex, userID)

  // Step 2: create a project (put it in the vault)
  const { projectID, publicKey, secretKey } = testProject
  const project: Project = {
    id: projectID,
    name: 'Test Project',
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
