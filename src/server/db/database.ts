import Knex from 'knex'
import serverRuntimeConfig from '~/src/server/env'

const maxDbConnections = parseInt(
  serverRuntimeConfig.DATABASE_MAX_CONNECTIONS || '11'
)

const db = Knex({
  client: 'pg',
  connection: serverRuntimeConfig.DATABASE_URI,
  searchPath: ['knex', 'public'],
  pool: {
    min: 1,
    max: maxDbConnections
  }
})

export default db
