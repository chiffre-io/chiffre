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
import { verifyJwt } from '../auth/jwt'
import { AuthClaims, TwoFactorStatus, CookieNames } from '../exports/defs'
import { isTokenBlacklisted } from '../redis/tokenBlacklist'

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
        let blacklisted: boolean = false
        try {
          blacklisted = await isTokenBlacklisted(
            app.redis.tokenBlacklist,
            claims.tokenID,
            claims.userID
          )
        } catch (error) {
          // Fail open, log the error & report it to Sentry
          req.log.error(error)
          app.sentry.report(error, req)
        }
        if (blacklisted) {
          throw new Error('Session has expired')
        }
        req.auth = claims
      } catch (error) {
        req.log.error(error)
        throw app.httpErrors.unauthorized(error)
      }
    }
  )
  next()
})
