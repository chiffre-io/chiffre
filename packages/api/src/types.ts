import { Server, IncomingMessage, ServerResponse } from 'http'
import { FastifyInstance } from 'fastify'
import Knex from 'knex'
import { Authenticate } from './plugins/auth'

export type App = FastifyInstance<Server, IncomingMessage, ServerResponse> & {
  db: Knex
  authenticate: Authenticate
}
