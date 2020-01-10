import fp from 'fastify-plugin'
import {
  FastifyRequest,
  FastifyReply,
  DefaultBody,
  DefaultHeaders,
  DefaultParams,
  DefaultQuery
} from 'fastify'
import fastifyCookie from 'fastify-cookie'
import { IncomingMessage } from 'http'
import { CookieNames } from '../auth/cookies'
import { verifyJwt } from '../auth/jwt'
import { AuthClaims, TwoFactorStatus } from '../auth/types'

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

export default fp((app, _, next) => {
  app.register(fastifyCookie)
  app.decorate(
    'authenticate',
    (acceptUnverifiedTwoFactor: boolean = false) => async (
      req: AuthenticatedRequest,
      res: FastifyReply<any>
    ) => {
      const claims = req.cookies[CookieNames.jwt] || ''
      const signature = req.cookies[CookieNames.sig] || ''
      const token = [claims, signature].join('.')
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
        req.auth = claims
      } catch (error) {
        res.status(401).send(error)
      }
    }
  )
  next()
})
