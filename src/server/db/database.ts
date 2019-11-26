import Knex from 'knex'
import serverRuntimeConfig from '../env'

const db = Knex({
  client: 'pg',
  connection: serverRuntimeConfig.DATABASE_URI,
  searchPath: ['knex', 'public']
})

export default db
