import Knex from 'knex'
import { PROJECT_MESSAGE_QUEUE_TABLE } from '../models/entities/ProjectMessageQueue'

export async function up(knex: Knex): Promise<any> {
  console.info('Adding field `country` to message')
  await knex.schema.table(PROJECT_MESSAGE_QUEUE_TABLE, table => {
    table.string('country').nullable()
  })
}

export async function down(knex: Knex): Promise<any> {
  console.info('Removing field `country` from message')
  await knex.schema.table(PROJECT_MESSAGE_QUEUE_TABLE, table => {
    table.dropColumn('country')
  })
}
