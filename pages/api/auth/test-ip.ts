import nextConnect from 'next-connect'
import { NextApiRequest, NextApiResponse } from 'next'

// --

const handler = nextConnect()

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  console.log({
    'req.socket.remoteAddress': req.socket.remoteAddress,
    'req.socket.remoteFamily': req.socket.remoteFamily,
    'req.headers': req.headers
  })
  res.json({})
})

export default handler
