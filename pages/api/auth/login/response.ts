import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import database, { Db } from '~/src/server/middleware/database'
import { Request } from '~/src/server/types'
import {
  findLoginChallenge,
  isChallengeExpired
} from '~/src/server/db/models/auth/LoginChallengesSRP'
import { serverLoginResponse } from '~/src/server/srp'
import { deleteLoginChallenge } from '~/src/server/db/models/auth/LoginChallengesSRP'
import { findUser } from '~/src/server/db/models/auth/UsersAuthSRP'
import { Session as SrpSession } from 'secure-remote-password/server'
import { createSession } from '~/src/server/db/models/auth/Sessions'

export interface LoginResponseParameters {
  userID: string
  challengeID: string
  ephemeral: string
  proof: string
}

export interface LoginResponseResponseBody {
  proof: string
  jwt?: string
  twoFactor?: boolean
  sessionID: string
}

// --

const handler = nextConnect()

handler.use(
  requireBodyParams<LoginResponseParameters>({
    userID: requiredString,
    challengeID: requiredString,
    ephemeral: requiredString,
    proof: requiredString
  })
)
handler.use(database)

handler.post(
  async (req: Request<Db, LoginResponseParameters>, res: NextApiResponse) => {
    const {
      userID,
      challengeID,
      ephemeral: clientEphemeral,
      proof: clientProof
    } = req.body

    const challenge = await findLoginChallenge(req.db, challengeID)
    if (!challenge) {
      return res.status(404).json({
        error: `Invalid challenge ID`
      })
    }
    if (challenge.userID !== userID) {
      return res.status(403).json({
        error: `Invalid user for this challenge`
      })
    }
    if (isChallengeExpired(challenge)) {
      try {
        await deleteLoginChallenge(req.db, challenge.id)
      } catch (error) {
        console.error('Failed to cleanup expired challenge', error)
      }
      return res.status(403).json({
        error: `Challenge response timeout`
      })
    }
    const user = await findUser(req.db, userID)
    if (!user) {
      return res.status(404).json({
        error: `User not found`
      })
    }

    let session: SrpSession = null
    try {
      session = serverLoginResponse(
        challenge.ephemeralSecret,
        clientEphemeral,
        user.salt,
        user.username,
        user.verifier,
        clientProof
      )
    } catch (error) {
      return res.status(401).json({
        error: `Incorrect username or password`
      })
    } finally {
      // Cleanup
      await deleteLoginChallenge(req.db, challenge.id)
    }

    // todo: Generate JWT and store in sessions table
    const sessionID = await createSession(req.db, userID)

    const body: LoginResponseResponseBody = {
      proof: session.proof,
      jwt: null,
      twoFactor: true,
      sessionID
    }
    res.json(body)
  }
)

handler.use((err, req, res, next) => {
  console.error(err)
})

export default handler