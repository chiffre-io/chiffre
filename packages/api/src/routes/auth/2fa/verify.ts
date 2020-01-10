import { App } from '../../../types'
import { AuthenticatedRequest } from '../../../plugins/auth'
import { findUser, markTwoFactorVerified } from '../../../db/models/auth/Users'
import { verifyTwoFactorToken, generateBackupCodes } from '../../../auth/2fa'
import { TwoFactorStatus } from '../../../auth/types'
import { AuthClaims } from '../../../auth/types'
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
        return res.status(422).send({
          error: 'Two-factor authentication is not active for this account'
        })
      }
      if (user.twoFactorStatus === TwoFactorStatus.verified) {
        return res.status(422).send({
          error: 'Two-factor authentication is already active'
        })
      }

      const verified = verifyTwoFactorToken(
        req.body.twoFactorToken,
        user.twoFactorSecret
      )
      if (!verified) {
        return res.status(401).send({
          error: `Invalid two-factor code`
        })
      }

      try {
        // Generate 8 codes of 128 bits, hex-encoded
        const backupCodes = generateBackupCodes(8, 16)
        await markTwoFactorVerified(app.db, req.auth.userID, backupCodes)
        const body: TwoFactorVerifyResponse = {
          backupCodes
        }

        const claims: AuthClaims = {
          ...req.auth,
          twoFactorStatus: TwoFactorStatus.verified
        }
        setJwtCookies(claims, res)
        req.log.info({ msg: '2FA activation verified', auth: claims })

        return res.send(body)
      } catch (error) {
        return res.status(401).send({
          error: 'Failed to verify two-factor authentication',
          details: error.message
        })
      }
    }
  )
}
