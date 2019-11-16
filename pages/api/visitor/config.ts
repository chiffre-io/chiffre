import nextConnect from 'next-connect'
import { NextApiRequest, NextApiResponse } from 'next'
import { FakeDB } from '../../../src/server/storage'
import { b64 } from '../../../src/client/engine/codec'

const handler = nextConnect()

handler.get(
  (req: NextApiRequest & { fakeDb: FakeDB }, res: NextApiResponse) => {
    const data = {
      publicKey: b64.encode(req.fakeDb.publicKey)
    }
    res.json(data)
  }
)

export default handler
