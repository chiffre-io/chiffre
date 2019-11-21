import { parse } from 'url'
import next from 'next'
import socketIO from 'socket.io'

import { createServer } from 'http'
import { ServerContext } from './storage'
import { b64 } from '../client/engine/crypto/primitives/codec'

const context: ServerContext = {
  publicKey: null,
  socket: null,
  dataPoints: []
}

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const requestListener = (req: any, res: any) => {
  // Be sure to pass `true` as the second argument to `url.parse`.
  // This tells it to parse the query portion of the URL.
  const parsedUrl = parse(req.url, true)
  req.context = context
  handle(req, res, parsedUrl)
}

app.prepare().then(() => {
  const port = parseInt(process.env.PORT || '3000', 10)

  const server = createServer(requestListener)

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })

  const io = socketIO(server)
  io.on('connection', client => {
    console.log(client.handshake.query)
    console.log(client.id, 'connected')
    context.socket = client
    context.publicKey = b64.decode(client.handshake.query.publicKey)
    client.on('disconnect', () => {
      console.log(client.id, 'disconnected')
      if (context.socket && context.socket.id === client.id) {
        context.socket = null
      }
    })
  })
})
