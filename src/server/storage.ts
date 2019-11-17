import socketIO from 'socket.io'
import { NextApiRequest } from 'next'

export interface ServerContext {
  publicKey?: Uint8Array
  socket?: socketIO.Socket
  dataPoints: any[]
}

export type NextApiRequestWithContext = NextApiRequest & {
  context: ServerContext
}
