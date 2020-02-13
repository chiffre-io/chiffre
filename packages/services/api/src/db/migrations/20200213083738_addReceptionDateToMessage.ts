import Knex from 'knex'
import { PROJECT_MESSAGE_QUEUE_TABLE } from '../models/entities/ProjectMessageQueue'
import { ProjectMessage } from '../models/entities/ProjectMessageQueue'

export async function up(knex: Knex): Promise<any> {
  console.info('Adding field `receivedAt` to message')
  await knex.schema.table(PROJECT_MESSAGE_QUEUE_TABLE, table => {
    table.timestamp('receivedAt')
  })

  type Message = ProjectMessage & { created_at: Date }
  const existing: Message[] = await knex
    .select('*')
    .from(PROJECT_MESSAGE_QUEUE_TABLE)
    .where({ receivedAt: null })

  for (const message of existing) {
    await knex(PROJECT_MESSAGE_QUEUE_TABLE)
      .update({
        receivedAt: message.created_at
      })
      .where({ id: message.id })
  }
}

export async function down(knex: Knex): Promise<any> {
  console.info('Removing field `receivedAt` from message')
  await knex.schema.table(PROJECT_MESSAGE_QUEUE_TABLE, table => {
    table.dropColumn('receivedAt')
  })
}
