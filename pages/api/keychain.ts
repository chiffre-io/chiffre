import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import { Request } from '~/src/server/types'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import {
  findKeychain,
  updateKeychain,
  KeychainUpdatableFields
} from '~/src/server/db/models/auth/Keychains'

// --

const handler = nextConnect()

handler.use(database)
handler.use(apiAuthMiddleware)

handler.get(async (req: Request<Db & ApiAuth>, res: NextApiResponse) => {
  const keychain = await findKeychain(req.db, req.auth.userID)
  return res.json(keychain)
})

// -----------------------------------------------------------------------------

type UpdateKeychainRequest = Request<Db & ApiAuth, UpdateKeychainParams>
interface UpdateKeychainParams extends KeychainUpdatableFields {}

handler.patch(
  requireBodyParams<UpdateKeychainParams>({
    encrypted: requiredString
  }),
  async (req: UpdateKeychainRequest, res: NextApiResponse) => {
    try {
      await updateKeychain(req.db, req.auth.userID, req.body)
      return res.status(204).send(null)
    } catch (error) {
      console.error(error)
      return res.status(401).json({
        error: 'Unauthorized',
        details: 'You are not allowed to edit this keychain'
      })
    }
  }
)

// -----------------------------------------------------------------------------

handler.delete(async (_: Request<Db & ApiAuth>, res: NextApiResponse) => {
  // Method not allowed: keychains can only be deleted when deleting an account.
  return res.status(405).send(null)
})

export default handler
