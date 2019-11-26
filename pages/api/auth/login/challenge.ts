import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import database, { Db } from '~/src/server/middleware/database'
import { Request } from '~/src/server/types'
import { serverLoginChallenge } from '~/src/server/srp'
import { findUserByUsername } from '~/src/server/db/models/auth/UsersAuthSRP'
import { saveLoginChallenge } from '~/src/server/db/models/auth/LoginChallengesSRP'

export interface LoginChallengeParameters {
  username: string
}

export interface LoginChallengeResponseBody {
  userID: string
  challengeID: string
  salt: string
  ephemeral: string
}

// --

const handler = nextConnect()

handler.use(
  requireBodyParams<LoginChallengeParameters>({
    username: requiredString
  })
)
handler.use(database)

handler.post(
  async (req: Request<Db, LoginChallengeParameters>, res: NextApiResponse) => {
    const { username } = req.body

    const user = await findUserByUsername(req.db, username)
    if (!user) {
      return res.status(404).json({
        error: `User ${username} not found`
      })
    }

    const serverEphemeral = serverLoginChallenge(user.verifier)
    const challengeID = await saveLoginChallenge(
      req.db,
      user.id,
      serverEphemeral.secret
    )

    const body: LoginChallengeResponseBody = {
      userID: user.id,
      challengeID,
      salt: user.salt,
      ephemeral: serverEphemeral.public
    }
    res.json(body)
  }
)

export default handler
