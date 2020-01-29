import Knex from 'knex'
import { PROJECTS_TABLE } from '../models/entities/Projects'

export async function up(knex: Knex): Promise<any> {
  console.info('Adding name, url, description columns to `projects`')

  await knex.schema.table(PROJECTS_TABLE, table => {
    table
      .string('name')
      .notNullable()
      .defaultTo('Unnamed project')
    table.string('url').nullable()
    table.text('description').nullable()
  })
}

export async function down(knex: Knex): Promise<any> {
  console.info('Removing name, url, description columns from `projects`')

  await knex.schema.table(PROJECTS_TABLE, table => {
    table.dropColumns('name', 'url', 'description')
  })
}
