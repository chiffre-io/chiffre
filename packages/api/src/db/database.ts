import Knex from 'knex'
import path from 'path'

export default function connectToDatabase() {
  const extension = path.extname(__filename).replace('.', '')
  const dbPath = path.dirname(__filename)
  const dotExt = `.${extension}`

  const maxDbConnections = parseInt(process.env.DATABASE_MAX_CONNECTIONS) || 5
  return Knex({
    client: 'pg',
    connection: process.env.DATABASE_URI,
    searchPath: ['knex', 'public'],
    asyncStackTraces: process.env.DEBUG === 'true',
    pool: {
      min: 1,
      max: maxDbConnections
    },
    migrations: {
      directory: path.join(dbPath, 'migrations'),
      extension,
      loadExtensions: [dotExt]
    }
  })
}
