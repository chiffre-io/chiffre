import './env'
import { parse } from 'url'
import next from 'next'
import { loggerMiddleware } from 'next-logger'
import socketIO from 'socket.io'
import setupCronTasks from './cron'
import rootLogger from './logger'
import express from 'express'

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

app.prepare().then(() => {
  const port = parseInt(process.env.PORT || '3000', 10)

  const server = express()

  server.use(loggerMiddleware(rootLogger))
  server.all('*', requestListener)

  const httpServer = server.listen(port, () => {
    rootLogger.info(`Server ready on http://localhost:${port}`)
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
