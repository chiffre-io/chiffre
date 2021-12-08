import checkEnv from '@47ng/check-env'
import { createServer as createFastifyServer } from 'fastify-micro'
import path from 'node:path'
import nextJsPlugin from 'server/plugins/nextjs'
import prismaPlugin from 'server/plugins/prisma'
import slackPlugin from 'server/plugins/slack'
import { getExtrasForSentry, getUserForSentry } from 'server/services/sentry'
import type { App } from 'server/types'

export { startServer } from 'fastify-micro'

export function createServer() {
  const runningInProduction = process.env.NODE_ENV === 'production'
  checkEnv({
    required: [
      // 'API_URL',
      // runningInProduction ? 'APP_URL' : null,
      // 'ADMIN_USER_ID',
      // 'DATABASE_URI',
      // 'DATABASE_NAME',
      // 'DATABASE_MAX_CONNECTIONS',
      // 'REDIS_URI',
      // 'INSTANCE_ID',
      // 'CLOAK_MASTER_KEY',
      // 'CLOAK_KEYCHAIN',
      // 'CLOAK_CURRENT_KEY',
      // 'JWT_SECRET',
      // 'JWT_ISSUER'
    ].filter(Boolean) as string[],
    unsafe: [
      'DEBUG',
      'CHIFFRE_API_DISABLE_CLOAK',
      'CHIFFRE_API_INSECURE_COOKIES',
      'CHIFFRE_API_ENABLE_FAKE_EVENT_GENERATOR'
    ]
  })

  const app = createFastifyServer({
    name: 'chiffre',
    redactEnv: runningInProduction
      ? [
          'ADMIN_USER_ID',
          'DATABASE_URI',
          'DATABASE_NAME',
          'REDIS_URI',
          'CLOAK_MASTER_KEY',
          'CLOAK_KEYCHAIN',
          'CLOAK_CURRENT_KEY',
          'JWT_SECRET',
          'JWT_ISSUER'
        ]
      : [],
    routesDir: path.resolve(__dirname, './routes'),
    printRoutes: 'console',
    configure: configurePlugins,
    sentry: {
      getUser: getUserForSentry,
      getExtra: getExtrasForSentry
    },
    underPressure: {
      exposeStatusRoute: {
        url: '/_health',
        routeOpts: {
          logLevel: 'error'
        },
        routeResponseSchemaOpts: {
          databaseOk: { type: 'boolean' },
          metrics: {
            type: 'object',
            properties: {
              eventLoopDelay: { type: 'number' },
              rssBytes: { type: 'number' },
              heapUsed: { type: 'number' },
              eventLoopUtilized: { type: 'number' }
            }
          }
        }
      },

      healthCheck: async function healthCheck(app: App) {
        try {
          // const databaseOk = Boolean(await app.db.raw('select 1'))
          return {
            databaseOk: false,
            metrics: app.memoryUsage()
          }
        } catch (error) {
          app.log.error(error)
          app.sentry.report(error as Error)
          return false
        }
      }
    }
  })

  // if (runningInProduction) {
  //   app.ready(() =>
  //     app.log.debug({
  //       msg: 'Routes loaded',
  //       routes: app.routes
  //     })
  //   )
  // }

  // app.register(fastifyCron, {
  //   jobs: [
  //     {
  //       name: 'instatusMetrics',
  //       cronTime: '0 * * * *', // Every hour
  //       onTick: instatusMetrics,
  //       startWhenReady: true,
  //       runOnInit: false
  //     }
  //     // process.env.CHIFFRE_API_ENABLE_FAKE_EVENT_GENERATOR === 'true'
  //     //   ? {
  //     //       name: 'generateFakeSessions',
  //     //       cronTime: '* * * * *', // Every minute
  //     //       onTick: generateFakeSessions as any,
  //     //       startWhenReady: true,
  //     //       runOnInit: true
  //     //     }
  //     //   : null
  //   ].filter(Boolean)
  // })

  // there's still something fishy here with the encapsulation.
  // Maybe there can be only one onClose hook ?

  app.addHook('onClose', async fastify => {
    fastify.log.info('Closing')
    try {
      await Promise.all([
        fastify.next.close(),
        fastify.prisma.$disconnect()
        // fastify.db.destroy()
      ])
    } catch (error) {
      fastify.log.error(error)
      fastify.sentry.report(error as any)
    } finally {
      fastify.log.info('Closed all connections to backing services')
    }
  })

  app.addHook('onClose', (fastify, done) => {
    fastify.log.info('On second onClose')
    done()
  })

  return app
}

// --

function configurePlugins(app: App) {
  app.register(nextJsPlugin)
  app.register(slackPlugin)
  app.register(prismaPlugin)
}
