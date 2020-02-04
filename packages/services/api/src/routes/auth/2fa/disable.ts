import { App } from '../../../types'
import { findUser, disableTwoFactor } from '../../../db/models/auth/Users'
import { logEvent, EventTypes } from '../../../db/models/business/Events'
import { AuthenticatedRequest } from '../../../plugins/auth'
import { TwoFactorStatus } from '../../../exports/defs'
import { setJwtCookies } from '../../../auth/cookies'
import { updateClaims } from '../../../auth/claims'
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
        body: twoFactorDisableParametersSchema,
        summary: 'Disable two factor authentication',
        description: 'Will only succeed if 2FA is fully active'
      }
    },
    async (req: Request, res) => {
      const user = await findUser(app.db, req.auth.userID)
      if (!user) {
        throw app.httpErrors.notFound('User not found')
      }
      if (user.twoFactorStatus === TwoFactorStatus.disabled) {
        throw app.httpErrors.conflict('Two Factor is already disabled')
      }

      const verified = verifyTwoFactorToken(
        req.body.twoFactorToken,
        user.twoFactorSecret,
        req.body.clientTime,
        app,
        req
      )
      if (!verified) {
        throw app.httpErrors.unauthorized('Invalid two-factor code')
      }

      await disableTwoFactor(app.db, req.auth.userID)

      const claims = updateClaims(req.auth, {
        twoFactorStatus: TwoFactorStatus.disabled
      })
      setJwtCookies(claims, res)
      await logEvent(app.db, EventTypes.twoFactorStatusChanged, req, {
        from: req.auth.twoFactorStatus,
        to: claims.twoFactorStatus
      })
      return res.send()
    }
  )
}
