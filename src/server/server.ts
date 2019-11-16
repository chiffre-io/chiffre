import { parse } from 'url'
import next from 'next'
import socketIO from 'socket.io'

import { createServer as createHttpServer } from 'http'
import { FakeDB } from './storage'
import { b64 } from '../client/engine/codec'

export const fakeDb: FakeDB = {
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
  req.fakeDb = fakeDb
  handle(req, res, parsedUrl)
}

app.prepare().then(() => {
  const port = parseInt(process.env.PORT || '3000', 10)

  const io = socketIO()
  io.on('connection', client => {
    console.log(client.handshake.query)
    console.log(client.id, 'connected')
    fakeDb.socket = client
    fakeDb.publicKey = b64.decode(client.handshake.query.publicKey)
    client.on('disconnect', () => {
      console.log(client.id, 'disconnected')
    })
  })
  io.listen(3001)
  console.log('SocketIO started on http://localhost:3001')

  createHttpServer(requestListener).listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
