import Knex from 'knex'
import { createInitialUsersAuthSrpTable } from '../models/auth/UsersAuthSRP'
import { createInitialLoginChallengesSrpTable } from '../models/auth/LoginChallengesSRP'
import { createInitialSessionsTable } from '../models/auth/Sessions'
import { createInitialUsersAuthSettingsTable } from '../models/auth/UsersAuthSettings'
import { createInitialKeychainsTable } from '../models/auth/Keychains'
import { createInitialProjectsTable } from '../models/projects/Projects'
import { setupUpdatedAtFieldAutoUpdate } from '../utility'

export async function up(knex: Knex): Promise<any> {
  console.info('Setting up database from scratch...')

  // Load extensions
  await knex.raw('create extension if not exists "uuid-ossp"') // Generate UUIDv4 IDs
  await setupUpdatedAtFieldAutoUpdate(knex)

  // Auth
  await createInitialUsersAuthSrpTable(knex)
  await createInitialUsersAuthSettingsTable(knex)
  await createInitialLoginChallengesSrpTable(knex)
  await createInitialSessionsTable(knex)
  await createInitialKeychainsTable(knex)

  // Projects
  await createInitialProjectsTable(knex)
}

export async function down(knex: Knex): Promise<any> {
  console.error('Not reverting initial migration')
}
