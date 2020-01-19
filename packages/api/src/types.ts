import { Server, IncomingMessage, ServerResponse } from 'http'
import { FastifyInstance } from 'fastify'
import Knex from 'knex'
import { Authenticate } from './plugins/auth'

export interface Route {
  path: string
  method: string
  auth: boolean
}

export type App = FastifyInstance<Server, IncomingMessage, ServerResponse> & {
  routes: Route[]
  db: Knex
  authenticate: Authenticate
}
