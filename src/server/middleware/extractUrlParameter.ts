import { NextApiMiddleware, Request } from '~/src/server/types'

export interface UrlParams<P> {
  params?: P
}

interface QueryLike {
  [key: string]: string | string[]
}

export const extractQueryParam = (name: string, query: QueryLike): string => {
  const value = query[name]
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
    req.params[name] = extractQueryParam(name, req.query)
    next()
  }
}

export default extractUrlParameter
