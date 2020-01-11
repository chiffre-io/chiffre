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
import { AuthenticatedRequest } from '../../../plugins/auth'
import { AuthClaims, TwoFactorStatus } from '../../../auth/types'
import { setJwtCookies } from '../../../auth/cookies'
import { TwoFactorEnableResponse } from './enable.schema'

// --

export default async (app: App) => {
  const path = '/auth/2fa/enable'
  app.post(
    path,
    {
      preValidation: [app.authenticate()]
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
      const claims: AuthClaims = {
        ...req.auth,
        twoFactorStatus: TwoFactorStatus.enabled // Will need to be verified
      }
      setJwtCookies(claims, res)
      req.log.info({ msg: '2FA Enabled', auth: claims })
      return res.send(body)
    }
  )

  /**
   * Cancel a pending request to enable 2FA.
   * Will fail if 2FA has been verified, call ./disable instead
   */
  app.delete(
    path,
    {
      preValidation: [app.authenticate(true)]
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
      const claims: AuthClaims = {
        ...req.auth,
        twoFactorStatus: TwoFactorStatus.disabled
      }
      setJwtCookies(claims, res)
      req.log.info({ msg: '2FA cancelled', auth: claims })
      return res.status(204).send(null)
    }
  )
}
