import { App } from '../../types'
import { AuthenticatedRequest } from '../../plugins/auth'
import { blacklistToken } from '../../redis/tokenBlacklist'
import { clearJwtCookies } from '../../auth/cookies'
import { logEvent, EventTypes } from '../../db/models/business/Events'

// --

export default async (app: App) => {
  app.post(
    '/auth/logout',
    {
      preValidation: [app.authenticate()]
    },
    async function logout(req: AuthenticatedRequest, res) {
      const ttl = (Date.now() - req.auth.sessionExpiresAt.getTime()) / 1000
      await blacklistToken(
        app.redis.tokenBlacklist,
        req.auth.tokenID,
        req.auth.userID,
        ttl
      )
      await logEvent(app.db, EventTypes.logout, req)
      clearJwtCookies(res)
      res.status(202).send()
    }
  )
}
