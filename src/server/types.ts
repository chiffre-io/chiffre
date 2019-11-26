import { NextApiResponse } from 'next'
import { RequestWithBody } from './middleware/requireBodyParams'

export type Request<T = {}, B = any> = RequestWithBody<B> & T

export type NextApiHandler<T = {}, B = any> = (
  req: Request<T, B>,
  res: NextApiResponse
) => void | Promise<void>

export type NextApiMiddleware<T = {}, B = any> = (
  req: Request<T, B>,
  res: NextApiResponse,
  next: () => void
) => void | Promise<void>
