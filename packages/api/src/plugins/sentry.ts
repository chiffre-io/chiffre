import fp from 'fastify-plugin'
import * as Sentry from '@sentry/node'
import { FastifyRequest } from 'fastify'
import { AuthenticatedRequest } from './auth'
import { findUser, User } from '../db/models/auth/Users'
import { App } from '../types'

type Request = FastifyRequest & Partial<AuthenticatedRequest>

export interface SentryReporter {
  report: (req: Request, error: Error) => Promise<void>
}

export default fp((app: App, _, next) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: process.env.LOG_COMMIT,
    environment: process.env.NODE_ENV,
    enabled: !!process.env.SENTRY_DSN
  })

  const reporter: SentryReporter = {
    async report(req, error) {
      let user: User
      if (req.auth) {
        try {
          user = await findUser(app.db, req.auth.userID)
        } catch {}
      }
      Sentry.withScope(scope => {
        scope.setUser({
          id: req.auth?.userID || 'no auth provided',
          username: user?.username || 'no auth provided'
        })
        scope.setTags({
          path: req.raw.url,
          instance: process.env.LOG_INSTANCE_ID
        })
        scope.setExtras({
          'token ID': req.auth?.tokenID || 'no auth provided',
          '2FA': req.auth?.twoFactorStatus || 'no auth provided',
          plan: req.auth?.plan || 'no auth provided',
          'request ID': req.id
        })
        Sentry.captureException(error)
      })
    }
  }

  app.decorate('sentry', reporter)

  app.setErrorHandler(async (error, req: Request, res) => {
    if (
      (error.statusCode >= 400 && error.statusCode < 500) ||
      error.validation
    ) {
      req.log.warn(error)
    } else {
      req.log.error(error)
    }

    if (error.validation) {
      return res.status(400).send(error)
    }
    if (error.statusCode) {
      // Error object already contains useful information
      return res.send(error)
    }

    // Report the error to Sentry
    await app.sentry.report(req, error)

    // Pass to the generic error handler (500)
    return res.send(error)
  })
  next()
})
