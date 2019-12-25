import { NextApiResponse } from 'next'
import { RequestWithBody } from './middleware/requireBodyParams'
import { ServerContext } from './server'
import { Logger } from 'pino'

export type Request<Fields = {}, Body = any> = RequestWithBody<Body> &
  ServerContext &
  Fields & {
    log: Logger
  }

export type NextApiHandler<Fields = {}, Body = any> = (
  req: Request<Fields, Body>,
  res: NextApiResponse
) => void | Promise<void>

export type NextApiMiddleware<Fields = {}, Body = any> = (
  req: Request<Fields, Body>,
  res: NextApiResponse,
  next: () => void
) => void | Promise<void>
