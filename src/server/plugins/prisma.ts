import type { PrismaClient } from '@prisma/client'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { createPrismaClient } from 'server/database/prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

const prismaPlugin: FastifyPluginAsync = async app => {
  const client = createPrismaClient(app.log)
  try {
    await client.$connect()
    app.decorate('prisma', client)
  } catch (error) {
    app.log.error(error)
    app.sentry.report(error as any)
  }
}

// --

export default fp(prismaPlugin, {
  fastify: '3.x',
  name: 'Prisma'
})
