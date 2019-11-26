import Knex from 'knex'
import { createInitialUsersAuthSrpTable } from '../models/auth/UsersAuthSRP'
import { createInitialLoginChallengesSrpTable } from '../models/auth/LoginChallengesSRP'

export async function up(knex: Knex): Promise<any> {
  console.info('Setting up database from scratch...')

  // Load extensions
  await knex.raw('create extension if not exists "uuid-ossp"') // Generate UUIDv4 IDs

  // Create initial tables
  await createInitialUsersAuthSrpTable(knex)
  await createInitialLoginChallengesSrpTable(knex)
}

export async function down(knex: Knex): Promise<any> {
  console.error('Not reverting initial migration')
}
