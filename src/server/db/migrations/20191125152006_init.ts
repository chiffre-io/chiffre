import Knex from 'knex'
import { createInitialUsersAuthSrpTable } from '../models/auth/UsersAuthSRP'
import { createInitialLoginChallengesSrpTable } from '../models/auth/LoginChallengesSRP'
import { createInitialSessionsTable } from '../models/auth/Sessions'
import { createInitialUsersAuthSettingsTable } from '../models/auth/UsersAuthSettings'

export async function up(knex: Knex): Promise<any> {
  console.info('Setting up database from scratch...')

  // Load extensions
  await knex.raw('create extension if not exists "uuid-ossp"') // Generate UUIDv4 IDs

  // Create initial tables
  await createInitialUsersAuthSrpTable(knex)
  await createInitialLoginChallengesSrpTable(knex)
  await createInitialUsersAuthSettingsTable(knex)
  await createInitialSessionsTable(knex)
}

export async function down(knex: Knex): Promise<any> {
  console.error('Not reverting initial migration')
}
