import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import database, { Db } from '~/src/server/middleware/database'
import { Request } from '~/src/server/types'
import { createUser } from '~/src/server/db/models/auth/Users'
import { createSession } from '~/src/server/db/models/auth/Sessions'
import ipAddressMiddleware, {
  IpAddress
} from '~/src/server/middleware/ipAddress'
import { createSessionIDCookie } from '~/src/server/cookies'
import { AuthClaims } from '~/src/shared/auth'
import {
  createKeychainRecord,
  KeychainRecord
} from '~/src/server/db/models/entities/Keychains'

export interface SignupParameters {
  username: string
  srpSalt: string
  srpVerifier: string
  masterSalt: string
  keychain: Omit<KeychainRecord, 'userID'>
}

export interface SignupResponse extends AuthClaims {}

// --

const handler = nextConnect()

handler.use(
  requireBodyParams<SignupParameters>({
    username: requiredString,
    srpSalt: requiredString,
    srpVerifier: requiredString,
    masterSalt: requiredString,
    keychain: obj => Object.values(obj).every(requiredString)
  })
)
handler.use(database)
handler.use(ipAddressMiddleware)

handler.post(
  async (
    req: Request<Db & IpAddress, SignupParameters>,
    res: NextApiResponse
  ) => {
    const { username, srpSalt, srpVerifier, masterSalt, keychain } = req.body

    try {
      // todo: Pack all operations into a transaction
      const { id: userID } = await createUser(req.db, {
        username,
        srpSalt,
        srpVerifier,
        masterSalt
      })
      await createKeychainRecord(req.db, { userID, ...keychain })

      const session = await createSession(
        req.db,
        userID,
        false, // 2FA not required by default
        req.ipAddress
      )

      const sidCookie = createSessionIDCookie(session)
      res.setHeader('Set-Cookie', [sidCookie])

      const body: SignupResponse = {
        userID,
        sessionID: session.id,
        sessionExpiresAt: session.expiresAt
      }
      return res
        .status(201) // Created
        .json(body)
    } catch (error) {
      if (error.code === '23505') {
        // duplicate key value violates unique constraint
        return res.status(409).json({
          error: 'This username is not available',
          details: error.detail
        })
      }
      console.error(error)
      return res.status(500).json({
        error: 'Unknown error',
        details: error.detail
      })
    }
  }
)

export default handler
