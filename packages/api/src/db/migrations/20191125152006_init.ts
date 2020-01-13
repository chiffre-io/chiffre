import Knex from 'knex'
import { createInitialUsersTable, USERS_TABLE } from '../models/auth/Users'
import {
  createInitialLoginChallengesSrpTable,
  LOGIN_CHALLENGES_SRP_TABLE
} from '../models/auth/LoginChallengesSRP'
import {
  createInitialKeychainsTable,
  KEYCHAINS_TABLE
} from '../models/entities/Keychains'
import {
  createInitialVaultsTable,
  VAULTS_TABLE
} from '../models/entities/Vaults'
import {
  createInitialProjectsTable,
  PROJECTS_TABLE
} from '../models/entities/Projects'
import {
  createInitialProjectMessageQueueTable,
  PROJECT_MESSAGE_QUEUE_TABLE
} from '../models/entities/ProjectMessageQueue'
import {
  createInitialUserVaultEdgesTable,
  USER_VAULT_EDGES_TABLE
} from '../models/entities/UserVaultEdges'
import {
  createInitialEventsTable,
  EVENTS_TABLE
} from '../models/business/Events'
import {
  setupUpdatedAtFieldAutoUpdate,
  setupBase64IdGenerator
} from '../utility'

export async function up(knex: Knex): Promise<any> {
  console.info('Setting up database from scratch...')

  // Load extensions
  await knex.raw('create extension if not exists "pgcrypto"')
  await knex.raw('create extension if not exists "uuid-ossp"') // Generate UUIDv4 IDs
  await setupBase64IdGenerator(knex)
  await setupUpdatedAtFieldAutoUpdate(knex)

  // Auth
  await createInitialUsersTable(knex)
  await createInitialLoginChallengesSrpTable(knex)

  // Encrypted business logic
  await createInitialKeychainsTable(knex)
  await createInitialVaultsTable(knex)
  await createInitialUserVaultEdgesTable(knex)
  await createInitialProjectsTable(knex)
  await createInitialProjectMessageQueueTable(knex)

  await createInitialEventsTable(knex)
}

export async function down(knex: Knex): Promise<any> {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run initial down migration in production')
  }

  await knex.schema.dropTableIfExists(EVENTS_TABLE)
  await knex.schema.dropTableIfExists(PROJECT_MESSAGE_QUEUE_TABLE)
  await knex.schema.dropTableIfExists(PROJECTS_TABLE)
  await knex.schema.dropTableIfExists(USER_VAULT_EDGES_TABLE)
  await knex.schema.dropTableIfExists(VAULTS_TABLE)
  await knex.schema.dropTableIfExists(KEYCHAINS_TABLE)
  await knex.schema.dropTableIfExists(LOGIN_CHALLENGES_SRP_TABLE)
  await knex.schema.dropTableIfExists(USERS_TABLE)
}
