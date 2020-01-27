import nanoid from 'nanoid'
import { App } from '../index'

export default async (app: App) => {
  app.get(
    '/subscribe/:roomID',
    {
      websocket: true
    },
    async (connection, _req, params) => {
      const socketID = nanoid()
      const roomID = params.roomID
      let roomSubs = app.subscribers.get(roomID)
      if (!roomSubs) {
        roomSubs = new Map()
      }
      roomSubs.set(socketID, connection.socket)
      app.subscribers.set(roomID, roomSubs)
      app.log.info({
        role: 'sub',
        room: roomID,
        socket: socketID,
        msg: 'Subscriber connected'
      })

      connection.socket.on('close', async () => {
        try {
          let roomSubs = app.subscribers.get(roomID)
          if (!roomSubs) {
            roomSubs = new Map()
          }
          roomSubs.delete(socketID)
          app.subscribers.set(roomID, roomSubs)
          app.log.info({
            role: 'sub',
            room: roomID,
            socket: socketID,
            msg: 'Subscriber disconnected'
          })
        } catch (error) {
          app.log.error({
            role: 'sub',
            room: roomID,
            socket: socketID,
            error
          })
        }
      })
    }
  )
}
