import './env'
import { parse } from 'url'
import next from 'next'
import { loggerMiddleware } from 'next-logger'
import socketIO from 'socket.io'
import nanoid from 'nanoid'
import setupCronTasks from './cron'
import { rootLogger, appLogger } from './logger'
import express, { Request, Response, NextFunction } from 'express'

export interface ServerContext {
  io: socketIO.Server
}

const context: ServerContext = {
  io: null
}

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const requestListener = (req: any, res: any) => {
  // Be sure to pass `true` as the second argument to `url.parse`.
  // This tells it to parse the query portion of the URL.
  const parsedUrl = parse(req.url, true)
  req.io = context.io
  handle(req, res, parsedUrl)
}

const handleHealthCheck = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['X-CleverCloud-Monitoring'] === 'telegraf') {
    // Handle Clever Cloud health checks
    // https://github.com/influxdata/telegraf/tree/master/plugins/outputs/health
    return res.sendStatus(200)
  }
  return next()
}

app.prepare().then(() => {
  const port = parseInt(process.env.PORT || '3000', 10)

  const server = express()

  const fingerprintingSalt = process.env.LOG_FINGERPRINT_SALT || nanoid()

  server.use('/', handleHealthCheck)
  server.use('/_next', loggerMiddleware(rootLogger, 'http', fingerprintingSalt))
  server.use('/api', loggerMiddleware(rootLogger, 'api', fingerprintingSalt))
  server.all('*', requestListener)

  const httpServer = server.listen(port, () => {
    appLogger.info(`Server ready on http://localhost:${port}`)
  })

  context.io = socketIO(httpServer)
  context.io.on('connection', client => {
    console.log(client.handshake.query)
    console.log(client.id, 'connected')
    client.on('disconnect', () => {
      console.log(client.id, 'disconnected')
    })
  })

  setupCronTasks()
})
