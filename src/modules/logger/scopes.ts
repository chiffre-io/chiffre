import type { FastifyLoggerInstance } from 'fastify'

export enum LoggerScopes {
  prisma = 'db:prisma',
  knex = 'db:pg',
  pluginSlack = 'plugin:slack'
}

export function scopedLogger(base: FastifyLoggerInstance, scope: LoggerScopes) {
  return base.child({ scope })
}
