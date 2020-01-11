import { serverLoginChallenge } from '../../../auth/srp'
import { findUserByUsername } from '../../../db/models/auth/Users'
import { saveLoginChallenge } from '../../../db/models/auth/LoginChallengesSRP'
import { App } from '../../../types'
import {
  loginChallengeParametersSchema,
  LoginChallengeParameters,
  LoginChallengeResponseBody
} from './challenge.schema'

// --

export default async (app: App) => {
  app.post<unknown, unknown, unknown, LoginChallengeParameters>(
    '/auth/login/challenge',
    {
      schema: {
        body: loginChallengeParametersSchema
      }
    },
    async (req, res) => {
      const { username } = req.body

      req.log.debug({ msg: 'Login challenge', username })

      const user = await findUserByUsername(app.db, username)
      if (!user) {
        throw app.httpErrors.notFound('User not found')
      }

      const serverEphemeral = serverLoginChallenge(user.srpVerifier)
      const challengeID = await saveLoginChallenge(
        app.db,
        user.id,
        serverEphemeral.secret
      )

      const body: LoginChallengeResponseBody = {
        userID: user.id,
        challengeID,
        srpSalt: user.srpSalt,
        ephemeral: serverEphemeral.public
      }
      return res.send(body)
    }
  )
}
