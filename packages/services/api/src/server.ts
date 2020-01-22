import checkEnv from '@47ng/check-env'
import Fastify from 'fastify'
import { getLoggerOptions, genReqId } from './logger'
import sensible from 'fastify-sensible'
import gracefulShutdown from 'fastify-graceful-shutdown'
import cors from 'fastify-cors'
import swagger from 'fastify-swagger'
import rateLimit from 'fastify-rate-limit'
import underPressure from 'under-pressure'
import { App, Route } from './types'
import fp from 'fastify-plugin'
import { AuthenticatedRequest } from './plugins/auth'
import { Plans } from './exports/defs'

export function createServer(): App {
  checkEnv({
    required: [
      'API_URL',
      process.env.NODE_ENV === 'production' ? 'APP_URL' : null,
      'DATABASE_URI',
      'DATABASE_MAX_CONNECTIONS',
      'REDIS_URI',
      'LOG_INSTANCE_ID',
      'LOG_COMMIT',
      'CLOAK_MASTER_KEY',
      'CLOAK_KEYCHAIN',
      'CLOAK_CURRENT_KEY',
      'JWT_SECRET',
      'JWT_ISSUER'
    ].filter(x => !!x),
    unsafe: [
      'DEBUG',
      'CHIFFRE_API_DISABLE_CLOAK',
      'CHIFFRE_API_DISABLE_GRACEFUL_SHUTDOWN',
      'CHIFFRE_API_INSECURE_COOKIES'
    ]
  })

  const app = Fastify({
    logger: getLoggerOptions(),
    // todo: Fix type when switching to Fastify 3.x
    genReqId: genReqId as any,
    trustProxy: process.env.TRUSTED_PROXY_IPS || false
  }) as App

  // Plugins
  app.register(sensible)
  if (process.env.CHIFFRE_API_DISABLE_GRACEFUL_SHUTDOWN !== 'true') {
    app.register(gracefulShutdown)
  }
  app.register(cors, {
    origin:
      process.env.NODE_ENV === 'production'
        ? /https:\/\/(.+\.)?chiffre\.io$/
        : process.env.APP_URL,
    allowedHeaders: [
      'accept',
      'authorization',
      'content-type',
      'cookie',
      'origin',
      'user-agent',
      'x-forwarded-for'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    maxAge: 600 // 10 minutes
  })
  app.register(swagger, {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'Chiffre API',
        description: 'API for the Chiffre.io service',
        version: process.env.LOG_COMMIT
      },
      host: (process.env.API_URL || '')
        .replace('https://', '')
        .replace('http://', ''),
      schemes: [process.env.NODE_ENV === 'production' ? 'https' : 'http'],
      consumes: ['application/json'],
      produces: ['application/json']
    },
    exposeRoute: true
  })

  // Local plugins
  app.register(require('./plugins/database').default)
  app.register(require('./plugins/redis').default)
  app.register(require('./plugins/auth').default)
  app.register(require('./plugins/sentry').default)
  app.register(
    fp((app: App, _, next) => {
      const routes: Route[] = []
      app.decorate('routes', routes)
      app.addHook('onRoute', route => {
        app.routes.push({
          path: route.path,
          method: route.method.toString(),
          auth: !!route.preValidation
        })
      })
      next()
    })
  )

  app.register(
    fp((app: App, _, next) => {
      app.register(rateLimit, {
        global: false,
        redis: app.redis.rateLimiting,
        whitelist: function rateLimitWhitelist(req: AuthenticatedRequest) {
          if (req.auth) {
            // Example of authorization-based limiting
            return req.auth.plan === Plans.unlimited
          }
          return false
        }
      })
      next()
    })
  )

  app.register(underPressure, {
    maxEventLoopDelay: 1000, // 1s
    // maxHeapUsedBytes: 100 * (1 << 20), // 100 MiB
    // maxRssBytes: 100 * (1 << 20), // 100 MiB
    healthCheckInterval: 5000, // 5 seconds
    exposeStatusRoute: {
      url: '/_health',
      routeOpts: {
        logLevel: 'warn'
      }
    },
    healthCheck: async () => {
      try {
        await app.db.raw('select 1')
        if (app.redis.srpChallenges.status !== 'ready') {
          throw new Error(
            `Redis status (SRP): ${app.redis.srpChallenges.status}`
          )
        }
        if (app.redis.tokenBlacklist.status !== 'ready') {
          throw new Error(
            `Redis status (Token Blacklist): ${app.redis.tokenBlacklist.status}`
          )
        }
        if (app.redis.rateLimiting.status !== 'ready') {
          throw new Error(
            `Redis status (Rate Limit): ${app.redis.rateLimiting.status}`
          )
        }
        return true
      } catch (error) {
        app.log.error(error)
        app.sentry.report(error)
        return false
      }
    }
  })

  app.get('/', { logLevel: 'silent' }, (req, res) => {
    // Handle Clever Cloud health checks (no logging)
    // https://github.com/influxdata/telegraf/tree/master/plugins/outputs/health
    if (req.headers['X-CleverCloud-Monitoring'] === 'telegraf') {
      res.send()
      return
    }
    // For all other calls to /, redirect to Swagger docs
    res.redirect('/documentation')
  })

  app.register(require('./routes').default)

  if (process.env.NODE_ENV === 'development') {
    app.ready(() => console.info(app.printRoutes()))
  } else {
    app.ready(() =>
      app.log.info({
        msg: 'Routes loaded',
        routes: app.routes
      })
    )
  }

  app.ready(() => {
    app.swagger()
  })

  app.addHook('onClose', async (app: App, done) => {
    app.log.info('Closing connections to the datastores')
    await Promise.all([
      app.redis.rateLimiting.quit(),
      app.redis.srpChallenges.quit(),
      app.redis.tokenBlacklist.quit(),
      app.db.destroy()
    ])
    app.log.info('Closed all connections to the datastores')
    done()
  })
  return app
}

// --

export async function startServer(app: App, port: number) {
  await new Promise(resolve => {
    app.listen({ port, host: '0.0.0.0' }, (error, address) => {
      if (error) {
        app.log.fatal({ msg: `Application startup error`, error, address })
        process.exit(1)
      } else {
        resolve()
      }
    })
  })
  return await app.ready()
}
