import { NextApiResponse } from 'next'
import { NextApiRequestWithContext } from '../../../src/server/storage'

export default (req: NextApiRequestWithContext, res: NextApiResponse) => {
  if (req.context.socket) {
    console.log('emit data-point', req.context.socket.id, req.body)
    req.context.socket.emit('data-point', req.body)
  }
  res.json({})
}
