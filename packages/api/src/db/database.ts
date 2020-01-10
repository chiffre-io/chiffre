import Knex from 'knex'

const maxDbConnections = parseInt(process.env.DATABASE_MAX_CONNECTIONS || '11')

export default function connectToDatabase() {
  return Knex({
    client: 'pg',
    connection: process.env.DATABASE_URI,
    searchPath: ['knex', 'public'],
    pool: {
      min: 1,
      max: maxDbConnections
    }
  })
}
