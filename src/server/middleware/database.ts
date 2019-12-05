import Knex from 'knex'
import { NextApiMiddleware } from '~/src/server/types'
import database from '~/src/server/db/database'

export interface Db {
  db: Knex
}

const databaseMiddleware: NextApiMiddleware<Db> = (req, _, next) => {
  req.db = database
  next()
}

export default databaseMiddleware
