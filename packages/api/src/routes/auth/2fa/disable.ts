import { App } from '../../../types'
import { findUser, disableTwoFactor } from '../../../db/models/auth/Users'
import { AuthenticatedRequest } from '../../../plugins/auth'
import { AuthClaims, TwoFactorStatus } from '../../../auth/types'
import { setJwtCookies } from '../../../auth/cookies'
import { verifyTwoFactorToken } from '../../../auth/2fa'
import {
  TwoFactorDisableParameters,
  twoFactorDisableParametersSchema
} from './disable.schema'

// --

type Request = AuthenticatedRequest<
  any,
  any,
  any,
  any,
  TwoFactorDisableParameters
>

export default async (app: App) => {
  const path = '/auth/2fa/disable'
  app.post<unknown, unknown, unknown, TwoFactorDisableParameters>(
    path,
    {
      preValidation: [app.authenticate()],
      schema: {
        body: twoFactorDisableParametersSchema
      }
    },
    async (req: Request, res) => {
      try {
        const user = await findUser(app.db, req.auth.userID)
        if (!user) {
          throw new Error('User not found')
        }
        if (user.twoFactorStatus === TwoFactorStatus.disabled) {
          throw new Error('Two Factor is already disabled')
        }

        const verified = verifyTwoFactorToken(
          req.body.twoFactorToken,
          user.twoFactorSecret
        )
        if (!verified) {
          return res.status(401).send({
            error: 'Invalid two-factor code'
          })
        }

        await disableTwoFactor(app.db, req.auth.userID)

        // Update JWT claims
        const claims: AuthClaims = {
          ...req.auth,
          twoFactorStatus: TwoFactorStatus.disabled
        }
        setJwtCookies(claims, res)
        req.log.info({ msg: '2FA Disabled', auth: claims })
        return res.send()
      } catch (error) {
        return res.status(422).send({
          error: 'Failed to disable two-factor authentication',
          details: error.message
        })
      }
    }
  )
}
