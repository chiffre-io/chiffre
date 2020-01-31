import path from 'path'
import checkEnv from '@47ng/check-env'
import WebSocket from 'ws'
import fastifyWs, { SocketStream } from 'fastify-websocket'
import { createServer, Server } from 'fastify-micro'
import Redis from 'ioredis'

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

  const app = createServer<App>({
    name: 'push',
    routesDir: path.join(__dirname, 'routes'),
    redactEnv: ['REDIS_URI'],
    underPressure: {
      exposeStatusRoute: {
        url: '/',
        routeOpts: {
          logLevel: 'silent'
        }
      },
      healthCheck: () => Promise.resolve(true)
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
      app.decorate('redis', new Redis(process.env.REDIS_URI, { db: 3 }))
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
    done()
  })

  return app
}
