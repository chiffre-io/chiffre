import { App } from '../../../types'
import {
  generateTwoFactorSecret,
  formatTwoFactorSecret
} from '../../../auth/2fa'
import {
  findUser,
  enableTwoFactor,
  cancelTwoFactor
} from '../../../db/models/auth/Users'
import { logEvent, EventTypes } from '../../../db/models/business/Events'
import { AuthenticatedRequest } from '../../../plugins/auth'
import { TwoFactorStatus } from '../../../exports/defs'
import { updateClaims } from '../../../auth/claims'
import { setJwtCookies } from '../../../auth/cookies'
import { TwoFactorEnableResponse } from './enable.schema'

// --

export default async (app: App) => {
  const path = '/auth/2fa/enable'
  app.post(
    path,
    {
      preValidation: [app.authenticate()],
      schema: {
        summary: 'Start enabling two factor authentication',
        description:
          'Complete flow for enabling 2FA will require verifying a TOTP token with /auth/2fa/verify.'
      }
    },
    async (req: AuthenticatedRequest, res) => {
      const user = await findUser(app.db, req.auth.userID)
      if (!user) {
        throw app.httpErrors.notFound('User not found')
      }
      if (user.twoFactorStatus !== TwoFactorStatus.disabled) {
        throw app.httpErrors.conflict('Two Factor is already active')
      }
      const secret = generateTwoFactorSecret()
      await enableTwoFactor(app.db, req.auth.userID, secret)
      const body: TwoFactorEnableResponse = formatTwoFactorSecret(
        secret,
        user.username
      )

      // Update JWT claims to indicate 2FA pending
      // note: this will disallow other operations while 2FA is not verified.
      const claims = updateClaims(req.auth, {
        twoFactorStatus: TwoFactorStatus.enabled // Will need to be verified
      })
      setJwtCookies(claims, res)
      await logEvent(app.db, EventTypes.twoFactorStatusChanged, req, {
        from: req.auth.twoFactorStatus,
        to: claims.twoFactorStatus
      })
      return res.send(body)
    }
  )

  app.delete(
    path,
    {
      preValidation: [app.authenticate(true)],
      schema: {
        summary: 'Cancel a pending request to enable two factor authentication',
        description:
          'It will fail if 2FA has been fully enabled (verified), use /auth/2fa/disable instead.'
      }
    },
    async (req: AuthenticatedRequest, res) => {
      const user = await findUser(app.db, req.auth.userID)
      if (!user) {
        throw app.httpErrors.notFound('User not found')
      }
      if (user.twoFactorStatus === TwoFactorStatus.disabled) {
        throw app.httpErrors.conflict('Two-factor authentication is not active')
      }
      if (user.twoFactorStatus === TwoFactorStatus.verified) {
        throw app.httpErrors.conflict(
          'Cannot cancel verified two-factor authentication. Use /auth/2fa/disable instead.'
        )
      }
      await cancelTwoFactor(app.db, req.auth.userID)

      const claims = updateClaims(req.auth, {
        twoFactorStatus: TwoFactorStatus.disabled
      })
      setJwtCookies(claims, res)
      await logEvent(app.db, EventTypes.twoFactorStatusChanged, req, {
        from: req.auth.twoFactorStatus,
        to: claims.twoFactorStatus
      })
      return res.status(204).send()
    }
  )
}
