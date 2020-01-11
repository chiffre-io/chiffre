import fp from 'fastify-plugin'
import * as Sentry from '@sentry/node'
import { FastifyRequest } from 'fastify'
import { AuthenticatedRequest } from './auth'
import { findUser, User } from '../db/models/auth/Users'
import { App } from '../types'

export default fp((app: App, _, next) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: process.env.LOG_COMMIT,
    environment: process.env.LOG_INSTANCE,
    enabled: !!process.env.SENTRY_DSN
  })

  app.setErrorHandler(
    async (error, req: FastifyRequest & Partial<AuthenticatedRequest>, res) => {
      if (error.statusCode >= 400 && error.statusCode < 500) {
        req.log.warn(error)
      } else {
        req.log.error(error)
      }

      if (error.statusCode) {
        // Error object already contains useful information
        return res.send(error)
      }

      let user: User
      if (req.auth) {
        try {
          user = await findUser(app.db, req.auth.userID)
        } catch {}
      }

      // Pass the unhandled error to Sentry
      Sentry.withScope(scope => {
        scope.setUser({
          id: req.auth?.userID || 'no auth provided',
          ip_address: req.ip,
          username: user?.username || 'no auth provided'
        })
        scope.setTag('path', req.raw.url)
        scope.setExtras({
          'token ID': req.auth?.tokenID || 'no auth provided',
          '2FA': req.auth?.twoFactorStatus || 'no auth provided',
          plan: req.auth?.plan || 'no auth provided',
          'request ID': req.id
        })
        Sentry.captureException(error)
      })
      // Pass to the generic error handler (500)
      return res.send(error)
    }
  )
  next()
})