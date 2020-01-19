import { Server, IncomingMessage, ServerResponse } from 'http'
import { FastifyInstance } from 'fastify'
import Knex from 'knex'
import { Authenticate } from './plugins/auth'
import redis from 'redis'
import type { SentryReporter } from './plugins/sentry'

export interface Route {
  path: string
  method: string
  auth: boolean
}

export type App = FastifyInstance<Server, IncomingMessage, ServerResponse> & {
  routes: Route[]
  db: Knex
  redis: redis.RedisClient
  authenticate: Authenticate
  sentry: SentryReporter
}
