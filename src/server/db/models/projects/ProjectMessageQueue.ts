import Knex from 'knex'
import { PROJECTS_TABLE } from './Projects'

export const PROJECT_MESSAGE_QUEUE_TABLE = 'project_message_queue'

interface ProjectMessageInput {
  projectID: string
  message: string
  performance: number
}

export interface ProjectMessage extends ProjectMessageInput {
  id: string
}

// --

export const pushMessage = async (
  db: Knex,
  projectID: string,
  message: string,
  performance: number
): Promise<ProjectMessage> => {
  const msg: ProjectMessageInput = {
    projectID,
    message,
    performance
  }
  const result = await db
    .insert(msg)
    .into(PROJECT_MESSAGE_QUEUE_TABLE)
    .returning<ProjectMessage[]>('*')
  return result[0]
}

export const findMessagesForProject = async (db: Knex, projectID: string) => {
  return await db
    .select<ProjectMessage[]>('*')
    .from(PROJECT_MESSAGE_QUEUE_TABLE)
    .where({ projectID })
}

// --

export const createInitialProjectMessageQueueTable = async (db: Knex) => {
  await db.schema.createTable(PROJECT_MESSAGE_QUEUE_TABLE, table => {
    table
      .uuid('id')
      .unique()
      .notNullable()
      .defaultTo(db.raw('uuid_generate_v4()'))
      .primary()
    table.uuid('projectID').notNullable()
    table.foreign('projectID').references(`${PROJECTS_TABLE}.id`)
    table.timestamp('created_at').defaultTo(db.fn.now())
    table.float('performance').notNullable()
    table.text('message').notNullable()
  })
}
