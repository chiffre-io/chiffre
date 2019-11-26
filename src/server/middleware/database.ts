import Knex from 'knex'
import serverRuntimeConfig from '../env'
import { NextApiMiddleware } from '../types'

export interface Db {
  db: Knex
}

const db = Knex({
  client: 'pg',
  connection: serverRuntimeConfig.DATABASE_URI,
  searchPath: ['knex', 'public']
})

const databaseMiddleware: NextApiMiddleware<Db> = (req, _, next) => {
  req.db = db
  next()
}

export default databaseMiddleware
