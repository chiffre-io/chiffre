import Knex from 'knex'
import { PROJECTS_TABLE } from './Projects'

export const PROJECT_MESSAGE_QUEUE_TABLE = 'project_message_queue'

export interface ProjectMessageInput {
  projectID: string
  message: string
  country?: string
  performance: number
}

export interface ProjectMessage extends ProjectMessageInput {
  id: string
}

// --

export async function pushMessage(
  db: Knex,
  projectID: string,
  message: string,
  performance: number,
  country?: string
): Promise<ProjectMessage> {
  const msg: ProjectMessageInput = {
    projectID,
    message,
    country,
    performance
  }
  const result = await db
    .insert(msg)
    .into(PROJECT_MESSAGE_QUEUE_TABLE)
    .returning<ProjectMessage[]>('*')
  return result[0]
}

export async function findMessagesForProject(
  db: Knex,
  projectID: string,
  before: Date = new Date(),
  after: Date = new Date(0)
) {
  return await db
    .select<ProjectMessage[]>('*')
    .from(PROJECT_MESSAGE_QUEUE_TABLE)
    .where({ projectID })
    .and.whereBetween('created_at', [after, before])
}

// --

export async function createInitialProjectMessageQueueTable(db: Knex) {
  await db.schema.createTable(PROJECT_MESSAGE_QUEUE_TABLE, table => {
    table
      .string('id')
      .unique()
      .notNullable()
      .defaultTo(db.raw('generate_b64id()'))
      .primary()
    table.string('projectID').notNullable()
    table.foreign('projectID').references(`${PROJECTS_TABLE}.id`)
    table.timestamp('created_at').defaultTo(db.fn.now())
    table.float('performance').notNullable()
    table.text('message').notNullable()

    // Migration log:
    // 20200131140113_addCountryToMessage.ts
  })
}
