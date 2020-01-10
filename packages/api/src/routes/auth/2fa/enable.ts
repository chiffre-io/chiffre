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
      try {
        const user = await findUser(app.db, req.auth.userID)
        if (!user) {
          throw new Error('User not found')
        }
        if (user.twoFactorStatus !== TwoFactorStatus.disabled) {
          throw new Error('Two Factor is already active')
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
      } catch (error) {
        return res.status(422).send({
          error: 'Failed to activate two-factor authentication',
          details: error.message
        })
      }
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
        return res.status(404).send({
          error: 'User not found',
          details: `User ID: ${req.auth.userID}`
        })
      }
      if (user.twoFactorStatus === TwoFactorStatus.disabled) {
        return res.status(422).send({
          error: 'Two-factor authentication is not active for this account',
          details: `User ID: ${req.auth.userID}`
        })
      }
      if (user.twoFactorStatus === TwoFactorStatus.verified) {
        return res.status(401).send({
          error: 'Cannot cancel verified two-factor authentication',
          details: `User ID: ${req.auth.userID}`,
          help: 'Use /auth/2fa/disable instead'
        })
      }
      try {
        await cancelTwoFactor(app.db, req.auth.userID)
        const claims: AuthClaims = {
          ...req.auth,
          twoFactorStatus: TwoFactorStatus.disabled
        }
        setJwtCookies(claims, res)
        req.log.info({ msg: '2FA Cancelled', auth: claims })
        return res.status(204).send(null)
      } catch (error) {
        return res.status(401).send({
          error: 'Failed to cancel two-factor authentication',
          details: error.message
        })
      }
    }
  )
}
