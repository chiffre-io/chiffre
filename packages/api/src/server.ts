import checkEnv from '@47ng/check-env'
import Fastify from 'fastify'
import { getLoggerOptions, genReqId } from './logger'
import sensible from 'fastify-sensible'
import gracefulShutdown from 'fastify-graceful-shutdown'
import cors from 'fastify-cors'
import swagger from 'fastify-swagger'
import underPressure from 'under-pressure'
import { App, Route } from './types'
import fp from 'fastify-plugin'

export function createServer(): App {
  checkEnv({
    required: [
      'API_URL',
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
    ],
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
        ? /https:\/\/.*\.chiffre\.io$/
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
        version: '0.0.1'
      },
      // externalDocs: {
      //   url: 'https://swagger.io',
      //   description: 'Find more info here'
      // },
      host: (process.env.API_URL || '')
        .replace('https://', '')
        .replace('http://', ''),
      schemes: [process.env.NODE_ENV === 'production' ? 'https' : 'http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      // tags: [
      //   { name: 'user', description: 'User related end-points' },
      //   { name: 'code', description: 'Code related end-points' }
      // ],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header'
        }
      }
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

  app.register(underPressure, {
    maxEventLoopDelay: 1000, // 1s
    // maxHeapUsedBytes: 100 * (1 << 20), // 100 MiB
    // maxRssBytes: 100 * (1 << 20), // 100 MiB
    healthCheckInterval: 1000,
    exposeStatusRoute: {
      url: '/_health',
      routeOpts: {
        logLevel: 'warn'
      }
    },
    healthCheck: async () => {
      try {
        await app.db.raw('select 1')
        // todo: Test Redis connection
        return true
      } catch (error) {
        console.error(error)
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
      await new Promise(resolve =>
        app.redis.quit((err, ok) => {
          if (err) {
            app.log.error(err)
          }
          return resolve(ok)
        })
      ),
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
