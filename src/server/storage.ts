import socketIO from 'socket.io'

export interface FakeDB {
  publicKey?: Uint8Array
  socket?: socketIO.Socket
  dataPoints: any[]
}
