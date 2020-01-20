import Knex from 'knex'
import path from 'path'
import { Logger } from 'pino'

export default function connectToDatabase(logger: Logger) {
  const extension = path.extname(__filename).replace('.', '')
  const dbPath = path.dirname(__filename)
  const dotExt = `.${extension}`
  const dbLogger = logger.child({ category: 'db.pg' })
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
    },
    debug: process.env.DEBUG === 'true',
    log: {
      debug: dbLogger.debug.bind(dbLogger),
      warn: dbLogger.warn.bind(dbLogger),
      error: dbLogger.error.bind(dbLogger),
      deprecate: dbLogger.warn.bind(dbLogger),
      enableColors: false
    }
  })
}
