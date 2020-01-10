import { App } from '../types'
import { createVault } from '../db/models/entities/Vaults'
import { AuthenticatedRequest } from '../plugins/auth'
import { CreateVaultParameters, CreateVaultResponse } from './vaults.schema'

// --

type Request = AuthenticatedRequest<any, any, any, any, CreateVaultParameters>

export default async (app: App) => {
  app.post(
    '/vaults',
    {
      preValidation: [app.authenticate()]
    },
    async (req: Request, res) => {
      try {
        const { id: vaultID } = await createVault(
          app.db,
          req.body.encrypted,
          req.auth.userID
        )
        const response: CreateVaultResponse = {
          vaultID
        }
        return res.status(201).send(response)
      } catch (error) {
        return res.status(401).send({
          error: 'Failed to create vault',
          details: error.message
        })
      }
    }
  )
}
