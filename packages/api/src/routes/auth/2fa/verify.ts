import { App } from '../../../types'
import { AuthenticatedRequest } from '../../../plugins/auth'
import { logEvent, EventTypes } from '../../../db/models/business/Events'
import { findUser, markTwoFactorVerified } from '../../../db/models/auth/Users'
import { verifyTwoFactorToken, generateBackupCodes } from '../../../auth/2fa'
import {
  AuthClaims,
  TwoFactorStatus,
  maxAgeInSeconds,
  getExpirationDate
} from '../../../exports/defs'
import { setJwtCookies } from '../../../auth/cookies'
import {
  TwoFactorVerifyParameters,
  twoFactorVerifyParametersSchema,
  TwoFactorVerifyResponse
} from './verify.schema'

// --

type Request = AuthenticatedRequest<
  any,
  any,
  any,
  any,
  TwoFactorVerifyParameters
>

export default async (app: App) => {
  app.post<unknown, unknown, unknown, TwoFactorVerifyParameters>(
    '/auth/2fa/verify',
    {
      preValidation: [app.authenticate(true)],
      schema: {
        body: twoFactorVerifyParametersSchema
      }
    },
    async (req: Request, res) => {
      const user = await findUser(app.db, req.auth.userID)
      if (user.twoFactorStatus === TwoFactorStatus.disabled) {
        throw app.httpErrors.conflict(
          'Two-factor authentication is not active for this account'
        )
      }
      if (user.twoFactorStatus === TwoFactorStatus.verified) {
        throw app.httpErrors.conflict(
          'Two-factor authentication is already active'
        )
      }

      const verified = verifyTwoFactorToken(
        req.body.twoFactorToken,
        user.twoFactorSecret
      )
      if (!verified) {
        throw app.httpErrors.unauthorized('Invalid two-factor code')
      }

      // Generate 8 codes of 128 bits, hex-encoded
      const backupCodes = generateBackupCodes(8, 16)
      await markTwoFactorVerified(app.db, req.auth.userID, backupCodes)
      const body: TwoFactorVerifyResponse = {
        backupCodes
      }

      const now = new Date()
      const claims: AuthClaims = {
        ...req.auth,
        twoFactorStatus: TwoFactorStatus.verified,
        // Refresh expiration time
        sessionExpiresAt: getExpirationDate(maxAgeInSeconds.session, now)
      }
      setJwtCookies(claims, res, now)
      await logEvent(app.db, EventTypes.twoFactorStatusChanged, req, {
        from: req.auth.twoFactorStatus,
        to: claims.twoFactorStatus
      })
      return res.send(body)
    }
  )
}
