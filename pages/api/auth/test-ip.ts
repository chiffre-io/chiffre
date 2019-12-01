import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import ipAddressMiddleware, {
  IpAddress
} from '~/src/server/middleware/ipAddress'
import { Request } from '~/src/server/types'

// --

const handler = nextConnect()
handler.use(ipAddressMiddleware)

handler.get(async (req: Request<IpAddress>, res: NextApiResponse) => {
  res.json({
    ip: req.ipAddress
  })
})

export default handler
