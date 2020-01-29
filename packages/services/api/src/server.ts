import path from 'path'
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
import serviceVersion from './version'

export function createServer(): App {
  const runningInProduction = process.env.NODE_ENV === 'production'

  checkEnv({
    required: [
      'API_URL',
      runningInProduction ? 'APP_URL' : null,
      'DATABASE_URI',
      'DATABASE_MAX_CONNECTIONS',
      'REDIS_URI',
      'INSTANCE_ID',
      'CLOAK_MASTER_KEY',
      'CLOAK_KEYCHAIN',
      'CLOAK_CURRENT_KEY',
      'JWT_SECRET',
      'JWT_ISSUER',
      runningInProduction ? 'SENTRY_DSN' : null
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
    origin: runningInProduction
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

  if (process.env.ENABLE_SWAGGER === 'true') {
    app.register(swagger, {
      routePrefix: '/documentation',
      swagger: {
        info: {
          title: 'Chiffre API',
          description: 'API for the Chiffre.io service',
          version: serviceVersion
        },
        host: (process.env.API_URL || '')
          .replace('https://', '')
          .replace('http://', ''),
        schemes: [runningInProduction ? 'https' : 'http'],
        consumes: ['application/json'],
        produces: ['application/json']
      },
      exposeRoute: true
    })
  }

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

  app.register(require('fastify-static'), {
    root: path.join(__dirname, '../public')
  })

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
    if (process.env.ENABLE_SWAGGER === 'true') {
      app.swagger()
    }
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
