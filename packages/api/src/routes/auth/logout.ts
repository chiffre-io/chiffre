import { App } from '../../types'
import { AuthenticatedRequest } from '../../plugins/auth'
import { getTokenBlacklistKey } from '../../auth/jwt'

// --

export default async (app: App) => {
  app.post(
    '/auth/logout',
    {
      preValidation: [app.authenticate()]
    },
    async function logout(req: AuthenticatedRequest, res) {
      app.redis.set(getTokenBlacklistKey(req.auth.tokenID), req.auth.userID)
      // todo: Return clear cookies
      res.status(202).send()
    }
  )
}
