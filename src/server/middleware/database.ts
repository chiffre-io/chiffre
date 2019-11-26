import Knex from 'knex'
import { NextApiMiddleware } from '../types'
import database from '../db/database'

export interface Db {
  db: Knex
}

const databaseMiddleware: NextApiMiddleware<Db> = (req, _, next) => {
  req.db = database
  next()
}

export default databaseMiddleware
