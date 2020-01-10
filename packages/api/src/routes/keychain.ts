import { App } from '../types'
import { AuthenticatedRequest } from '../plugins/auth'
import {
  findKeychain,
  updateKeychain,
  KeychainUpdatableFields
} from '../db/models/entities/Keychains'

// --

type PatchRequest = AuthenticatedRequest<
  any,
  any,
  any,
  any,
  KeychainUpdatableFields
>

export default async (app: App) => {
  app.get(
    '/keychain',
    {
      preValidation: [app.authenticate()]
    },
    async (req: AuthenticatedRequest, res) => {
      const keychain = await findKeychain(app.db, req.auth.userID)
      return res.send(keychain)
    }
  )

  app.patch(
    '/keychain',
    {
      preValidation: [app.authenticate()]
    },
    async (req: PatchRequest, res) => {
      try {
        await updateKeychain(app.db, req.auth.userID, req.body)
        return res.status(204).send(null)
      } catch (error) {
        console.error(error)
        return res.status(401).send({
          error: 'Unauthorized',
          details: 'You are not allowed to edit this keychain'
        })
      }
    }
  )
}
