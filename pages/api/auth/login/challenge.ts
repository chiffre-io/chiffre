import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import database, { Db } from '~/src/server/middleware/database'
import { Request } from '~/src/server/types'
import { serverLoginChallenge } from '~/src/server/srp'
import { findUserByUsername } from '~/src/server/db/models/auth/Users'
import { saveLoginChallenge } from '~/src/server/db/models/auth/LoginChallengesSRP'

export interface LoginChallengeParameters {
  username: string
}

export interface LoginChallengeResponseBody {
  userID: string
  challengeID: string
  srpSalt: string
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

    req.log.debug({ msg: 'Login challenge', username })

    const user = await findUserByUsername(req.db, username)
    if (!user) {
      // Don't reveal if the account exists or not
      return res.status(401).json({
        error: `Incorrect username or password`
      })
    }

    const serverEphemeral = serverLoginChallenge(user.srpVerifier)
    const challengeID = await saveLoginChallenge(
      req.db,
      user.id,
      serverEphemeral.secret
    )

    const body: LoginChallengeResponseBody = {
      userID: user.id,
      challengeID,
      srpSalt: user.srpSalt,
      ephemeral: serverEphemeral.public
    }
    res.json(body)
  }
)

export default handler
