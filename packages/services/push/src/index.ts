import path from 'path'
import checkEnv from '@47ng/check-env'
import WebSocket from 'ws'
import fastifyWs, { SocketStream } from 'fastify-websocket'
import { createServer, Server } from 'fastify-micro'
import Redis from 'ioredis'
import readPkg from 'read-pkg'

export * from './types'

export interface App extends Server {
  websocketServer: WebSocket.Server // this should be exposed by fastify-websocket
  gracefulShutdown: (f: (signal: string, next: () => void) => void) => void
  subscribers: Map<string, Map<string, WebSocket>>
  redis: Redis.Redis
}

export default function createApp() {
  checkEnv({
    required: ['REDIS_URI']
  })
  const pkg = readPkg.sync({
    cwd: path.resolve(__dirname, '..')
  })

  const app = createServer<App>({
    name: `push@${pkg.version}`,
    routesDir: path.resolve(__dirname, 'routes'),
    redactEnv: ['REDIS_URI'],
    sentry: {
      release: process.env.COMMIT_ID
    },
    underPressure: {
      exposeStatusRoute: {
        url: '/',
        routeOpts: {
          logLevel: 'silent'
        }
      },
      healthCheck: async (app: App) => {
        try {
          if (
            !['connect', 'ready', 'connecting', 'reconnecting'].includes(
              app.redis.status
            )
          ) {
            throw new Error(`Redis status: ${app.redis.status}`)
          }
          return true
        } catch (error) {
          app.log.error(error)
          app.sentry.report(error)
          return false
        }
      }
    },
    configure: app => {
      app.decorate('subscribers', new Map())
      app.register(fastifyWs, {
        handle: function handleGlobalWebSocketConnection(socket: SocketStream) {
          // We're not using the global websocket connection for now
          console.log('global handler: nope')
          socket.end()
        },
        options: {
          clientTracking: true,
          maxPayload: 1 << 20, // 1 MiB
          verifyClient: function(_info, next) {
            // todo: Handle auth here
            next(true) // the connection is allowed
          }
        }
      })
      // Redis
      {
        const redis = new Redis(process.env.REDIS_URI, { db: 3 })
        redis.on('error', error => {
          app.log.error({
            msg: `Redis error`,
            plugin: 'redis',
            error
          })
          app.sentry.report(error)
        })
        app.decorate('redis', redis)
      }
    }
  })

  app.register((app: App, _, next) => {
    app.gracefulShutdown((_signal, next) => {
      app.websocketServer.clients.forEach(client =>
        client.close(
          1012,
          'The service is restarting, try connecting again later'
        )
      )
      next()
    })
    next()
  })

  app.addHook('onClose', async (app: App, done) => {
    app.log.info({ msg: 'onClose' })
    await app.redis.quit()
    done()
  })

  return app
}
