import { App } from '../../../types'
import { verifyTwoFactorToken } from '../../../auth/2fa'
import { findUser } from '../../../db/models/auth/Users'
import { logEvent, EventTypes } from '../../../db/models/business/Events'
import { AuthenticatedRequest } from '../../../plugins/auth'
import { TwoFactorStatus } from '../../../exports/defs'
import { updateClaims } from '../../../auth/claims'
import { setJwtCookies } from '../../../auth/cookies'
import {
  Login2FAParameters,
  login2FAParametersSchema,
  Login2FAResponseBody
} from './2fa.schema'

export default async (app: App) => {
  app.post<unknown, unknown, unknown, Login2FAParameters>(
    '/auth/login/2fa',
    {
      preValidation: [app.authenticate(true)],
      schema: {
        body: login2FAParametersSchema
      }
    },
    async (req: AuthenticatedRequest, res) => {
      const { twoFactorToken } = req.body

      const user = await findUser(app.db, req.auth.userID)
      if (!user) {
        throw app.httpErrors.notFound('User not found')
      }

      const body: Login2FAResponseBody = {
        masterSalt: user.masterSalt
      }

      if (req.auth.twoFactorStatus === TwoFactorStatus.verified) {
        req.log.info({ msg: '2FA already verified', auth: req.auth })
        // Already verified
        return res.send(body)
      }

      if (
        user.twoFactorStatus !== TwoFactorStatus.verified ||
        !user.twoFactorSecret
      ) {
        // Don't give too much information
        throw app.httpErrors.conflict(
          'Two-factor authentication is not activated for this account'
        )
      }

      const verified = verifyTwoFactorToken(
        twoFactorToken,
        user.twoFactorSecret
      )
      if (!verified) {
        throw app.httpErrors.unauthorized('Invalid two-factor code')
      }

      const claims = updateClaims(req.auth, {
        twoFactorStatus: TwoFactorStatus.verified
      })
      setJwtCookies(claims, res)
      await logEvent(app.db, EventTypes.twoFactorVerified, req)
      return res.send(body)
    }
  )
}
