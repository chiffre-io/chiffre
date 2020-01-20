import nanoid from 'nanoid'
import { serverLoginResponse } from '../../../auth/srp'
import { logEvent, EventTypes } from '../../../db/models/business/Events'
import { findUser } from '../../../db/models/auth/Users'
import { findSrpChallenge, cleanupSrpChallenge } from '../../../redis/srp'
import { Session as SrpSession } from 'secure-remote-password/server'
import { setJwtCookies } from '../../../auth/cookies'
import { App } from '../../../types'
import { Plans, TwoFactorStatus } from '../../../exports/defs'
import { makeClaims } from '../../../auth/claims'
import {
  loginResponseParametersSchema,
  LoginResponseParameters,
  LoginResponseResponseBody
} from './response.schema'

// --

export default async (app: App) => {
  app.post<unknown, unknown, unknown, LoginResponseParameters>(
    '/auth/login/response',
    {
      schema: {
        body: loginResponseParametersSchema
      }
    },
    async (req, res) => {
      const {
        userID,
        challengeID,
        ephemeral: clientEphemeral,
        proof: clientProof
      } = req.body

      const serverEphemeral = await findSrpChallenge(
        app.redis.srpChallenges,
        userID,
        challengeID
      )
      if (!serverEphemeral) {
        throw app.httpErrors.notFound('Invalid challenge ID or timeout')
      }
      const user = await findUser(app.db, userID)
      if (!user) {
        throw app.httpErrors.notFound('User not found')
      }

      let srpSession: SrpSession = null
      try {
        srpSession = serverLoginResponse(
          serverEphemeral,
          clientEphemeral,
          user.srpSalt,
          user.username,
          user.srpVerifier,
          clientProof
        )
        await cleanupSrpChallenge(app.redis.srpChallenges, userID, challengeID)
      } catch (error) {
        req.log.error({ msg: 'SRP login response failure', error })
        throw app.httpErrors.unauthorized('Incorrect username or password')
      }

      const twoFactorRequired =
        user.twoFactorStatus === TwoFactorStatus.verified

      const claims = makeClaims({
        userID,
        plan: Plans.free, // todo: Pull from user entry in database
        twoFactorStatus: twoFactorRequired
          ? TwoFactorStatus.enabled // Will need to be verified
          : TwoFactorStatus.disabled
      })
      setJwtCookies(claims, res)

      const masterSalt = twoFactorRequired ? undefined : user.masterSalt

      const body: LoginResponseResponseBody = {
        proof: srpSession.proof,
        masterSalt
      }
      await logEvent(app.db, EventTypes.login, { ...req, auth: claims })
      return res.send(body)
    }
  )
}
