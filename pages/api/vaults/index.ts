import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import { Request } from '~/src/server/types'
import { createVault } from '~/src/server/db/models/vaults/Vaults'

// --

export interface CreateVaultArgs {
  encrypted: string
}

export interface CreateVaultResponse {
  vaultID: string
}

const handler = nextConnect()

handler.use(
  requireBodyParams<CreateVaultArgs>({
    encrypted: requiredString
  })
)
handler.use(database)
handler.use(apiAuthMiddleware)

handler.post(
  async (req: Request<Db & ApiAuth, CreateVaultArgs>, res: NextApiResponse) => {
    try {
      const { id } = await createVault(req.db, req.body.encrypted)
      const response: CreateVaultResponse = {
        vaultID: id
      }
      return res.status(201).send(response)
    } catch (error) {
      return res.status(401).json({
        error: 'Failed to create vault',
        details: error.message
      })
    }
  }
)

export default handler
