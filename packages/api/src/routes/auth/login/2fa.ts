import { App } from '../../../types'
import { verifyTwoFactorToken } from '../../../auth/2fa'
import { findUser } from '../../../db/models/auth/Users'
import { AuthenticatedRequest } from '../../../plugins/auth'
import { TwoFactorStatus, AuthClaims } from '../../../auth/types'
import {
  Login2FAParameters,
  login2FAParametersSchema,
  Login2FAResponseBody
} from './2fa.schema'
import { setJwtCookies } from '../../../auth/cookies'

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
        return res.status(404).send({
          error: `User not found`
        })
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
        return res.status(422).send({
          error: `Cannot proceed with 2FA authentication`
        })
      }

      const verified = verifyTwoFactorToken(
        twoFactorToken,
        user.twoFactorSecret
      )
      if (!verified) {
        return res.status(401).send({
          error: `Invalid two-factor code`
        })
      }

      try {
        const claims: AuthClaims = {
          ...req.auth,
          twoFactorStatus: TwoFactorStatus.verified
        }
        setJwtCookies(claims, res)
        req.log.info({ msg: '2FA verified', auth: req.auth })

        return res.send(body)
      } catch (error) {
        return res.status(401).send({
          error: `Authentication error`,
          details: error.message
        })
      }
    }
  )
}
