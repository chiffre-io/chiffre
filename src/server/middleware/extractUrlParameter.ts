import { NextApiMiddleware, Request } from '~/src/server/types'

export interface UrlParams<P> {
  params?: P
}

const extractParam = (name: string, req: Request): string => {
  const value = req.query[name]
  if (!value) {
    return null
  }
  return typeof value === 'string' ? value : value[0]
}

const extractUrlParameter = <P>(
  name: string
): NextApiMiddleware<UrlParams<P>> => {
  return (req, _, next) => {
    if (!req.params) {
      req.params = {} as P
    }
    req.params[name] = extractParam(name, req)
    next()
  }
}

export default extractUrlParameter
