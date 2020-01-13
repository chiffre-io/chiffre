import checkEnv from '@47ng/check-env'
import Fastify from 'fastify'
import setupCronTasks from './cron'
import { getLoggerOptions, genReqId } from './logger'
import sensible from 'fastify-sensible'
import gracefulShutdown from 'fastify-graceful-shutdown'
import cors from 'fastify-cors'
import swagger from 'fastify-swagger'
import underPressure from 'under-pressure'
import { App } from './types'

export function createServer(): App {
  checkEnv({
    required: [
      'API_URL',
      'DATABASE_URI',
      'DATABASE_MAX_CONNECTIONS',
      'LOG_INSTANCE_ID',
      'LOG_COMMIT',
      'CLOAK_MASTER_KEY',
      'CLOAK_KEYCHAIN',
      'CLOAK_CURRENT_KEY',
      'JWT_SECRET',
      'JWT_ISSUER'
    ],
    unsafe: ['LOCAL_INSECURE_COOKIES', 'CLOAK_DISABLED']
  })

  const app = Fastify({
    logger: getLoggerOptions(),
    // todo: Fix type when swithcing to Fastify 3.x
    genReqId: genReqId as any,
    trustProxy: process.env.TRUSTED_PROXY_IPS || false
  })

  // Plugins
  app.register(sensible)
  app.register(gracefulShutdown)
  app.register(underPressure, {
    maxEventLoopDelay: 1000, // 1s
    // maxHeapUsedBytes: 100 * (1 << 20), // 100 MiB
    // maxRssBytes: 100 * (1 << 20), // 100 MiB
    exposeStatusRoute: {
      url: '/_health',
      routeOpts: {
        logLevel: 'warn'
      }
    },
    healthCheck: async () => {
      return true
    }
  })
  app.register(cors, {
    origin: ['http://localhost', /https:\/\/.*\.chiffre\.io$/]
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
  app.register(require('./plugins/auth').default)
  app.register(require('./plugins/database').default)
  app.register(require('./plugins/sentry').default)

  app.get('/', { logLevel: 'silent' }, (_req, res) => {
    // Handle Clever Cloud health checks (no logging)
    // https://github.com/influxdata/telegraf/tree/master/plugins/outputs/health
    // if (req.headers['X-CleverCloud-Monitoring'] === 'telegraf') {
    // }
    res.send()
  })

  app.register(require('./routes').default)

  if (process.env.NODE_ENV === 'development') {
    app.ready(() => console.info(app.printRoutes()))
  }

  app.ready(() => {
    app.swagger()
  })

  return app as App
}

// --

export function startServer(app: App, port: number) {
  app.listen({ port, host: '0.0.0.0' }, (error, address) => {
    if (error) {
      app.log.fatal({ msg: `Application startup error`, error, address })
    }
  })
  setupCronTasks()
}
