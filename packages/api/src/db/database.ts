import Knex from 'knex'

export default function connectToDatabase() {
  const maxDbConnections = parseInt(process.env.DATABASE_MAX_CONNECTIONS) || 5
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
