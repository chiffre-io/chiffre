import Knex from 'knex'
import { USERS_TABLE, User } from '../models/auth/Users'

export async function up(knex: Knex): Promise<any> {
  console.info('Adding field `displayName` to users')
  await knex.schema.table(USERS_TABLE, table => {
    table.text('displayName')
  })

  const existing: User[] = await knex
    .select('*')
    .from(USERS_TABLE)
    .where({ displayName: null })

  for (const user of existing) {
    await knex(USERS_TABLE)
      .where({ id: user.id })
      .update({
        displayName: user.username
      })
  }
}

export async function down(knex: Knex): Promise<any> {
  console.info('Removing field `displayName` from users')
  await knex.schema.table(USERS_TABLE, table => {
    table.dropColumn('displayName')
  })
}
