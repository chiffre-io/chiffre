import { App } from '../types'
import { AuthenticatedRequest } from '../plugins/auth'
import {
  getUserQuerySchema,
  userResponseSchema,
  UserResponse,
  GetUserQuery
} from './users.schema'
import { findUserByUsername } from '../db/models/auth/Users'
import { findKeychain } from '../db/models/entities/Keychains'

// --

type Request = AuthenticatedRequest<any, GetUserQuery, any, any>

export default async (app: App) => {
  app.get<GetUserQuery>(
    '/users',
    {
      preValidation: [app.authenticate()],
      schema: {
        querystring: getUserQuerySchema,
        response: {
          200: userResponseSchema
        }
      }
    },
    async (req: Request, res) => {
      const user = await findUserByUsername(app.db, req.query.username)
      if (!user) {
        throw app.httpErrors.notFound('User not found')
      }
      const keychain = await findKeychain(app.db, user.id)
      const response: UserResponse = {
        userID: user.id,
        username: user.username,
        sharingPublicKey: keychain.sharingPublicKey,
        signaturePublicKey: keychain.signaturePublicKey
      }
      return res.status(200).send(response)
    }
  )
}