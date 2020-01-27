import nanoid from 'nanoid'
import { App } from '../index'

export default async (app: App) => {
  app.get(
    '/publish/:roomID',
    {
      websocket: true
    },
    (connection, _req, params) => {
      const socketID = nanoid()
      const roomID = params.roomID
      app.log.info({
        role: 'pub',
        room: roomID,
        socket: socketID,
        msg: 'Publisher connected'
      })
      connection.socket.on('message', message => {
        const roomSubs = app.subscribers.get(roomID)
        if (roomSubs) {
          roomSubs.forEach((sub, subID) => {
            sub.send(message)
            app.log.debug({
              room: roomID,
              pub: socketID,
              sub: subID,
              msg: message
            })
          })
        }
      })
      connection.socket.on('close', () => {
        app.log.info({
          role: 'pub',
          room: roomID,
          socket: socketID,
          msg: 'Publisher disconnected'
        })
      })
    }
  )
}
