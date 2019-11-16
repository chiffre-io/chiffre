import { NextApiRequest, NextApiResponse } from 'next'
import { FakeDB } from '../../../src/server/storage'

export default (
  req: NextApiRequest & { fakeDb: FakeDB },
  res: NextApiResponse
) => {
  if (req.fakeDb.socket) {
    console.log('emit data-point', req.fakeDb.socket.id, req.body)
    req.fakeDb.socket.emit('data-point', req.body)
  }
  res.json({})
}
