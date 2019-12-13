import { NextApiMiddleware } from '~/src/server/types'

export interface IpAddress {
  ipAddress?: string
}

const ipAddressMiddleware: NextApiMiddleware<IpAddress> = (req, _, next) => {
  const xForwardedFor = req.headers['x-forwarded-for']
  if (xForwardedFor) {
    req.ipAddress =
      typeof xForwardedFor === 'string'
        ? xForwardedFor.split(',')[0]
        : xForwardedFor[0]
  } else {
    req.ipAddress = req.socket.remoteAddress
  }
  next()
}

export default ipAddressMiddleware
