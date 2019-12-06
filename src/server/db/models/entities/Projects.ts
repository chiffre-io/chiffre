import Knex from 'knex'
import { updatedAtFieldAutoUpdate } from '~/src/server/db/utility'
import { VAULTS_TABLE } from './Vaults'

export const PROJECTS_TABLE = 'projects'

interface ProjectInput {
  vaultID: string
  publicKey: string // In clear-text
  secretKey: string // Encrypted with the vault key
}

export interface Project extends ProjectInput {
  id: string
}

// --

export const createProject = async (
  db: Knex,
  vaultID: string,
  publicKey: string,
  secretKey: string
): Promise<Project> => {
  const project: ProjectInput = {
    vaultID,
    publicKey,
    secretKey
  }
  const result = await db
    .insert(project)
    .into(PROJECTS_TABLE)
    .returning<Project[]>('*')
  return result[0]
}

export const findProject = async (db: Knex, id: string) => {
  const result = await db
    .select<Project[]>('*')
    .from(PROJECTS_TABLE)
    .where({ id })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return result[0]
}

export const deleteProject = async (db: Knex, id: string) => {
  return await db
    .from(PROJECTS_TABLE)
    .where({ id })
    .delete()
}

export const findAllProjectsInVault = async (db: Knex, vaultID: string) => {
  return await db
    .select<Project[]>('*')
    .from(PROJECTS_TABLE)
    .where({ vaultID })
}

// --

export const createInitialProjectsTable = async (db: Knex) => {
  await db.schema.createTable(PROJECTS_TABLE, table => {
    table.timestamps(true, true)
    table
      .uuid('id')
      .unique()
      .notNullable()
      .defaultTo(db.raw('uuid_generate_v4()'))
      .primary()
    table.uuid('vaultID').notNullable()
    table.foreign('vaultID').references(`${VAULTS_TABLE}.id`)
    table.string('publicKey').notNullable()
    table.string('secretKey').notNullable()
  })
  await updatedAtFieldAutoUpdate(db, PROJECTS_TABLE)
}
