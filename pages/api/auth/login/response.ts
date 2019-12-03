import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import database, { Db } from '~/src/server/middleware/database'
import ipAddressMiddleware, {
  IpAddress
} from '~/src/server/middleware/ipAddress'
import { Request } from '~/src/server/types'
import {
  findLoginChallenge,
  isChallengeExpired
} from '~/src/server/db/models/auth/LoginChallengesSRP'
import { createJwt } from '~/src/server/jwt'
import { serverLoginResponse } from '~/src/server/srp'
import { deleteLoginChallenge } from '~/src/server/db/models/auth/LoginChallengesSRP'
import { findUser } from '~/src/server/db/models/auth/UsersAuthSRP'
import { Session as SrpSession } from 'secure-remote-password/server'
import { createSession } from '~/src/server/db/models/auth/Sessions'
import { userRequiresTwoFactorAuth } from '~/src/server/db/models/auth/UsersAuthSettings'
import { createJwtCookie } from '~/src/server/cookies'

export interface LoginResponseParameters {
  userID: string
  challengeID: string
  ephemeral: string
  proof: string
}

export interface LoginResponseResponseBody {
  proof: string
  sessionID: string
  twoFactor: boolean
  jwt?: string // Will be sent if twoFactor is false
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
handler.use(ipAddressMiddleware)

handler.post(
  async (
    req: Request<Db & IpAddress, LoginResponseParameters>,
    res: NextApiResponse
  ) => {
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

    let srpSession: SrpSession = null
    try {
      srpSession = serverLoginResponse(
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

    const twoFactorRequired = await userRequiresTwoFactorAuth(req.db, user.id)
    const session = await createSession(
      req.db,
      user.id,
      twoFactorRequired,
      req.ipAddress
    )

    const jwt = twoFactorRequired
      ? null
      : createJwt({
          userID: user.id,
          sessionID: session.id,
          sessionExpiresAt: session.expiresAt
        })

    if (jwt) {
      // Put JWT in a cookie to authenticate SSR requests
      const jwtCookie = createJwtCookie(jwt, session)
      res.setHeader('Set-Cookie', [jwtCookie])
    }

    const body: LoginResponseResponseBody = {
      proof: srpSession.proof,
      jwt,
      twoFactor: twoFactorRequired,
      sessionID: session.id
    }
    res.json(body)
  }
)

// todo: Factor better error handlers & logging story
handler.use((err, req, res, next) => {
  console.error(err)
})

export default handler
