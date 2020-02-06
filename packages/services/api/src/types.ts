import Knex from 'knex'
import { FastifyRequest } from 'fastify'
import { Server } from 'fastify-micro'
import { Authenticate, AuthenticatedRequest } from './plugins/auth'
import { RedisInstances } from './plugins/redis'

export interface Route {
  path: string
  method: string
  auth: boolean
}

export interface App extends Server {
  routes: Route[]
  db: Knex
  redis: RedisInstances
  authenticate: Authenticate
}

export type Request = FastifyRequest & Partial<AuthenticatedRequest>
