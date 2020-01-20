import { Server, IncomingMessage, ServerResponse } from 'http'
import { FastifyInstance } from 'fastify'
import Knex from 'knex'
import { Authenticate } from './plugins/auth'
import type { SentryReporter } from './plugins/sentry'
import type { RedisInstances } from './plugins/redis'

export interface Route {
  path: string
  method: string
  auth: boolean
}

export type App = FastifyInstance<Server, IncomingMessage, ServerResponse> & {
  routes: Route[]
  db: Knex
  redis: RedisInstances
  authenticate: Authenticate
  sentry: SentryReporter
}
