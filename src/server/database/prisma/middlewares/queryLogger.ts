import type { Prisma } from '@prisma/client'
import type { FastifyLoggerInstance } from 'fastify'
import { performance } from 'perf_hooks'

export function queryLoggerMiddleware(
  logger: FastifyLoggerInstance
): Prisma.Middleware {
  return async function queryLoggerMiddleware(params, next) {
    const tick = performance.now()
    const result = await next(params)
    const tock = performance.now()
    const operation = [params.model, params.action].join('.')
    logger.debug({
      msg: 'Query performance',
      operation,
      model: params.model,
      action: params.action,
      durationMs: +(tock - tick).toFixed(2)
    })
    return result
  }
}
