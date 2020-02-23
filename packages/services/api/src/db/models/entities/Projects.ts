import Knex from 'knex'
import { updatedAtFieldAutoUpdate } from '../../utility'
import { VAULTS_TABLE } from './Vaults'

export const PROJECTS_TABLE = 'projects'

export interface ProjectInput {
  name: string
  description?: string
  url: string
  vaultID: string
  publicKey: string // In clear-text
  secretKey: string // Encrypted with the vault key
}

export interface Project extends ProjectInput {
  id: string
}

// --

export async function createProject(
  db: Knex,
  project: ProjectInput
): Promise<Project> {
  const result = await db
    .insert(project)
    .into(PROJECTS_TABLE)
    .returning<Project[]>('*')
  return result[0]
}

export async function findProject(db: Knex, id: string) {
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

export async function deleteProject(db: Knex, id: string) {
  return await db
    .from(PROJECTS_TABLE)
    .where({ id })
    .delete()
}

export async function findAllProjectsInVault(db: Knex, vaultID: string) {
  return await db
    .select<Project[]>('*')
    .from(PROJECTS_TABLE)
    .where({ vaultID })
}

// --

export async function createInitialProjectsTable(db: Knex) {
  await db.schema.createTable(PROJECTS_TABLE, table => {
    table.timestamps(true, true)
    table
      .string('id')
      .unique()
      .notNullable()
      .defaultTo(db.raw('generate_b64id()'))
      .primary()
    table.string('vaultID').notNullable()
    table.foreign('vaultID').references(`${VAULTS_TABLE}.id`)
    table.string('publicKey').notNullable()
    table.string('secretKey').notNullable()

    // Migration log:
    // 20200129113026_addProjectNameUrlDescription.ts
  })
  await updatedAtFieldAutoUpdate(db, PROJECTS_TABLE)
}
