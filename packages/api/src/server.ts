import checkEnv from '@47ng/check-env'
import Fastify from 'fastify'
import setupCronTasks from './cron'
import { getLoggerOptions, genReqId } from './logger'
import sensible from 'fastify-sensible'
import gracefulShutdown from 'fastify-graceful-shutdown'
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
  app.register(require('./plugins/auth').default)
  app.register(require('./plugins/database').default)

  app.get('/', (req, res) => {
    if (req.headers['X-CleverCloud-Monitoring'] === 'telegraf') {
      // Handle Clever Cloud health checks
      // https://github.com/influxdata/telegraf/tree/master/plugins/outputs/health
    }
    res.status(200).send()
  })

  app.register(require('./routes').default)

  if (process.env.NODE_ENV === 'development') {
    app.ready(() => console.info(app.printRoutes()))
  }

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
