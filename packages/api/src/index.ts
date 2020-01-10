import dotenv from 'dotenv'
import envAlias from 'env-alias'
import checkEnv from '@47ng/check-env'
import Fastify from 'fastify'
import setupCronTasks from './cron'
import { getLoggerOptions, genReqId } from './logger'
import sensible from 'fastify-sensible'

export * from './routes'
export * from './auth/types'

// Setup environment
dotenv.config()
envAlias()

const defaultPort = parseInt(process.env.PORT || '3000', 10)

export default async function bootstrapServer(port: number = defaultPort) {
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
    unsafe: ['LOCAL_INSECURE_COOKIES']
  })

  const app = Fastify({
    logger: getLoggerOptions(),
    // todo: Fix type when swithcing to Fastify 3.x
    genReqId: genReqId as any,
    trustProxy: process.env.TRUSTED_PROXY_IPS || false
  })

  app.register(sensible)
  app.register(require('./plugins/auth').default)
  app.register(require('./plugins/database').default)

  app.get('/', (req, res) => {
    if (req.headers['X-CleverCloud-Monitoring'] === 'telegraf') {
      // Handle Clever Cloud health checks
      // https://github.com/influxdata/telegraf/tree/master/plugins/outputs/health
    }
    res.status(200)
    res.send()
  })

  app.register(require('./routes').default)

  if (process.env.NODE_ENV === 'development') {
    app.ready(() => console.info(app.printRoutes()))
  }

  app.listen({ port, host: '0.0.0.0' }, (error, address) => {
    if (error) {
      app.log.fatal({ msg: `Application startup error`, error, address })
    }
  })

  setupCronTasks()
}

if (require.main === module) {
  bootstrapServer()
}
