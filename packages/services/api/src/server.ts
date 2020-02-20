import checkEnv from '@47ng/check-env'
import { createServer as createMicroServer } from 'fastify-micro'
import fp from 'fastify-plugin'
import cors from 'fastify-cors'
import swagger from 'fastify-swagger'
import rateLimit from 'fastify-rate-limit'
import { App, Route, Request } from './types'
import { AuthenticatedRequest } from './plugins/auth'
import { Plans } from './exports/defs'
import { User, findUser } from './db/models/auth/Users'
import { checkRedisHealth } from './plugins/redis'

export { startServer } from 'fastify-micro'

function configurePlugins(app: App) {
  const runningInProduction = process.env.NODE_ENV === 'production'

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
    maxAge: 3600 // 1h
  })

  // Local plugins
  app.register(require('./plugins/database').default)
  app.register(require('./plugins/redis').default)
  app.register(require('./plugins/auth').default)
  app.register(require('./plugins/ingress').default)

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
}

// --

export default function createServer(): App {
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
      'JWT_ISSUER'
    ].filter(x => !!x),
    unsafe: [
      'DEBUG',
      'CHIFFRE_API_DISABLE_CLOAK',
      'CHIFFRE_API_DISABLE_GRACEFUL_SHUTDOWN',
      'CHIFFRE_API_INSECURE_COOKIES'
    ]
  })

  const app = createMicroServer({
    name: 'api',
    configure: configurePlugins,
    sentry: {
      release: process.env.COMMIT_ID,
      getUser: async function getSentryUser(app: App, req: Request) {
        let user: User
        if (req?.auth) {
          try {
            user = await findUser(app.db, req.auth.userID)
          } catch {}
        }
        return {
          id: req?.auth?.userID || 'no auth provided',
          username: user?.username || 'no auth provided'
        }
      },
      getExtras: async function getSentryExtras(_app: App, req?: Request) {
        return {
          'token ID': req?.auth?.tokenID || 'no auth provided',
          '2FA': req?.auth?.twoFactorStatus || 'no auth provided',
          plan: req?.auth?.plan || 'no auth provided'
        }
      }
    },
    underPressure: {
      exposeStatusRoute: {
        url: '/',
        routeOpts: {
          logLevel: 'silent'
        }
      },
      healthCheck: async function healthCheck(app: App) {
        try {
          await app.db.raw('select 1')
          checkRedisHealth(app.redis.srpChallenges, 'SRP')
          checkRedisHealth(app.redis.tokenBlacklist, 'Token Blacklist')
          checkRedisHealth(app.redis.rateLimiting, 'Rate Limit')
          checkRedisHealth(app.redis.ingressData, 'Ingress Data')
          checkRedisHealth(app.redis.ingressDataSub, 'Ingress Sub')
          return true
        } catch (error) {
          app.log.error(error)
          app.sentry.report(error)
          return false
        }
      }
    }
  })

  // Plugins
  if (process.env.ENABLE_SWAGGER === 'true') {
    app.register(swagger, {
      routePrefix: '/documentation',
      swagger: {
        info: {
          title: 'Chiffre API',
          description: 'API for the Chiffre.io service',
          version: '1'
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

  // Load routes
  app.register(require('./routes').default)

  if (runningInProduction) {
    app.ready(() =>
      app.log.debug({
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
    // Shut down the subscription first to avoid retriggering ingress processing
    await app.redis.ingressDataSub.quit()
    app.log.info('Waiting for ingress to finish its current batch')
    await app.ingress.promise
    app.log.info('Closing connections to the datastores')
    await Promise.all([
      app.redis.rateLimiting.quit(),
      app.redis.srpChallenges.quit(),
      app.redis.tokenBlacklist.quit(),
      app.redis.ingressData.quit(),
      app.db.destroy()
    ])
    app.log.info('Closed all connections to the datastores')
    done()
  })
  return app
}
