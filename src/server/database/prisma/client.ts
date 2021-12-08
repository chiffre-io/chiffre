import { PrismaClient } from '@prisma/client'
import type { FastifyLoggerInstance } from 'fastify'
import { LoggerScopes, scopedLogger } from 'modules/logger/scopes'
import { fieldEncryptionMiddleware } from 'prisma-field-encryption'
import { queryLoggerMiddleware } from './middlewares/queryLogger'

export function createPrismaClient(logger: FastifyLoggerInstance) {
  const __DEV__ = process.env.NODE_ENV === 'development'
  const dbLogger = scopedLogger(logger, LoggerScopes.prisma)
  const client = new PrismaClient({
    errorFormat: __DEV__ ? 'pretty' : 'colorless',
    log: [
      {
        level: 'error',
        emit: 'event'
      },
      {
        level: 'warn',
        emit: 'event'
      },
      {
        level: 'info',
        emit: 'event'
      },
      {
        level: 'query',
        emit: 'event'
      }
    ]
  })
  client.$use(queryLoggerMiddleware(dbLogger))
  client.$use(fieldEncryptionMiddleware())
  client.$on('query', event => dbLogger.debug({ msg: 'Query', event }))
  client.$on('error', event => dbLogger.error({ msg: 'Query error', event }))
  client.$on('warn', event => dbLogger.warn({ msg: 'Query warning', event }))
  client.$on('info', event => dbLogger.info({ msg: 'Query info', event }))
  client.$on('beforeExit', () =>
    dbLogger.info({ msg: 'Prisma client is exiting' })
  )
  return client
}
