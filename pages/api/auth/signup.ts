import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import database, { Db } from '~/src/server/middleware/database'
import { Request } from '~/src/server/types'
import { createUser } from '~/src/server/db/models/auth/UsersAuthSRP'

export interface SignupParameters {
  username: string
  salt: string
  verifier: string
}

// --

const handler = nextConnect()

handler.use(
  requireBodyParams<SignupParameters>({
    username: requiredString,
    salt: requiredString,
    verifier: requiredString
  })
)
handler.use(database)

handler.post(
  async (req: Request<Db, SignupParameters>, res: NextApiResponse) => {
    const { username, salt, verifier } = req.body

    try {
      await createUser(req.db, username, salt, verifier)
    } catch (error) {
      if (error.code === '23505') {
        // duplicate key value violates unique constraint
        return res.status(409).json({
          error: 'This username is already in use',
          details: error.detail
        })
      }
      console.error(error)
      return res.status(500).json({
        error: 'Unknown error',
        details: error.detail
      })
    }
    return res
      .status(201) // Created
      .send(null)
  }
)

export default handler
