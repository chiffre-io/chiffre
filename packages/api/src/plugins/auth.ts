import fp from 'fastify-plugin'
import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  DefaultBody,
  DefaultHeaders,
  DefaultParams,
  DefaultQuery
} from 'fastify'
import fastifyCookie from 'fastify-cookie'
import { IncomingMessage } from 'http'
import { App } from '../types'
import { verifyJwt, getTokenBlacklistKey } from '../auth/jwt'
import { AuthClaims, TwoFactorStatus, CookieNames } from '../exports/defs'

export type AuthenticatedRequest<
  R = IncomingMessage,
  Q = DefaultQuery,
  P = DefaultParams,
  H = DefaultHeaders,
  B = DefaultBody
> = FastifyRequest<R, Q, P, H, B> & { auth: AuthClaims }

export type Authenticate = (
  acceptUnverifiedTwoFactor?: boolean
) => (req: FastifyRequest, res: FastifyReply<any>) => Promise<any>

function recomposeTokenFromCookies(app: FastifyInstance, req: FastifyRequest) {
  const claims = req.cookies[CookieNames.jwt] || ''
  const signature = req.cookies[CookieNames.sig] || ''
  if (claims.length === 0 && signature.length === 0) {
    throw app.httpErrors.unauthorized('Authentication required')
  }
  if (claims.length === 0 && signature.length > 0) {
    // Only signature is present => most likely session expiration
    throw app.httpErrors.unauthorized('Your session has expired')
  }
  return [claims, signature].join('.')
}

export default fp((app: App, _, next) => {
  app.register(fastifyCookie)
  app.decorate(
    'authenticate',
    (acceptUnverifiedTwoFactor: boolean = false) => async (
      req: AuthenticatedRequest,
      _res: FastifyReply<any>
    ) => {
      let token = ((req.headers.authorization as string) || '').slice(
        'Bearer '.length
      )
      if (token.length === 0) {
        token = recomposeTokenFromCookies(app, req)
      }

      try {
        const claims = verifyJwt(token)
        if (
          !acceptUnverifiedTwoFactor &&
          claims.twoFactorStatus !== TwoFactorStatus.verified &&
          claims.twoFactorStatus !== TwoFactorStatus.disabled
        ) {
          // Do not accept invalid or unverified 2FA sessions
          throw new Error('Invalid or unverified 2FA status')
        }
        await new Promise((resolve, reject) => {
          app.redis.get(
            getTokenBlacklistKey(claims.tokenID),
            (error, value) => {
              if (error) {
                req.log.error(error)
                // todo: Pass the error to Sentry ?
                return resolve() // Fail open
              }
              if (value === claims.userID) {
                // Token is blacklisted
                return reject('Session has expired')
              }
              resolve()
            }
          )
        })
        req.auth = claims
      } catch (error) {
        req.log.error(error)
        throw app.httpErrors.unauthorized(error)
      }
    }
  )
  next()
})
