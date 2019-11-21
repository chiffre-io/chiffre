import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import { NextApiRequestWithContext } from '../../../src/server/storage'
import { b64 } from '../../../src/client/engine/crypto/primitives/codec'

const handler = nextConnect()

handler.get((req: NextApiRequestWithContext, res: NextApiResponse) => {
  const data = {
    publicKey: req.context.publicKey ? b64.encode(req.context.publicKey) : null
  }
  res.json(data)
})

export default handler
