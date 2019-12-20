import Knex from 'knex'
import { createInitialUsersAuthSrpTable } from '../models/auth/UsersAuthSRP'
import { createInitialLoginChallengesSrpTable } from '../models/auth/LoginChallengesSRP'
import { createInitialSessionsTable } from '../models/auth/Sessions'
import { createInitialUsersAuthSettingsTable } from '../models/auth/UsersAuthSettings'
import { createInitialKeychainsTable } from '../models/entities/Keychains'
import { createInitialVaultsTable } from '../models/entities/Vaults'
import { createInitialProjectsTable } from '../models/entities/Projects'
import { createInitialProjectMessageQueueTable } from '../models/entities/ProjectMessageQueue'
import { createInitialUserVaultEdgesTable } from '../models/entities/UserVaultEdges'
import { setupUpdatedAtFieldAutoUpdate } from '../utility'

export async function up(knex: Knex): Promise<any> {
  console.info('Setting up database from scratch...')

  // Load extensions
  await knex.raw('create extension if not exists "pgcrypto"')
  await knex.raw('create extension if not exists "uuid-ossp"') // Generate UUIDv4 IDs
  await setupBase64IdGenerator(knex)
  await setupUpdatedAtFieldAutoUpdate(knex)

  // Auth
  await createInitialUsersAuthSrpTable(knex)
  await createInitialUsersAuthSettingsTable(knex)
  await createInitialLoginChallengesSrpTable(knex)
  await createInitialSessionsTable(knex)

  // Encrypted business logic
  await createInitialKeychainsTable(knex)
  await createInitialVaultsTable(knex)
  await createInitialUserVaultEdgesTable(knex)
  await createInitialProjectsTable(knex)
  await createInitialProjectMessageQueueTable(knex)
}

export async function down(knex: Knex): Promise<any> {
  console.error('Not reverting initial migration')
}
