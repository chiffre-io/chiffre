import { App } from '../types'
import { AuthenticatedRequest } from '../plugins/auth'
import {
  findKeychain,
  updateKeychain,
  KeychainUpdatableFields
} from '../db/models/entities/Keychains'
import { KeychainResponse } from './keychain.schema'

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
      const response: KeychainResponse = {
        key: keychain.key,
        signature: {
          public: keychain.signaturePublicKey,
          secret: keychain.signatureSecretKey
        },
        sharing: {
          public: keychain.sharingPublicKey,
          secret: keychain.sharingSecretKey
        }
      }
      return res.send(response)
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
        throw app.httpErrors.forbidden(
          'You are not allowed to edit this keychain'
        )
      }
    }
  )
}
