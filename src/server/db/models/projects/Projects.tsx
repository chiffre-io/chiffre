import Knex from 'knex'
import { USERS_AUTH_SRP_TABLE } from '../auth/UsersAuthSRP'
import { updatedAtFieldAutoUpdate } from '../../utility'

export const PROJECTS_TABLE = 'projects'

interface ProjectInput {
  publicKey: string
  encrypted: string
  creator: string
}

export interface Project extends ProjectInput {
  id: string
}

// --

export const createProject = async (
  db: Knex,
  userID: string,
  publicKey: string,
  encrypted: string
): Promise<Project> => {
  const project: ProjectInput = {
    publicKey,
    encrypted,
    creator: userID
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

export const updateProject = async (
  db: Knex,
  id: string,
  creator: string,
  encrypted: string,
  publicKey?: string
) => {
  return await db<Project>(PROJECTS_TABLE)
    .update({ encrypted, publicKey })
    .where({ id, creator })
}

export const deleteProject = async (db: Knex, id: string, creator: string) => {
  return await db
    .from(PROJECTS_TABLE)
    .where({ id, creator })
    .delete()
}

export const getAllProjectsForUser = async (db: Knex, userID: string) => {
  return await db
    .select<Project[]>('*')
    .from(PROJECTS_TABLE)
    .where({ creator: userID })
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
    table.string('publicKey').notNullable()
    table.text('encrypted').notNullable()
    table.uuid('creator').notNullable()
    table.foreign('creator').references(`${USERS_AUTH_SRP_TABLE}.id`)
  })
  await updatedAtFieldAutoUpdate(db, PROJECTS_TABLE)
}
