import nanoid from 'nanoid'
import { serverLoginResponse } from '../../../auth/srp'
import { logEvent, EventTypes } from '../../../db/models/business/Events'
import { findUser } from '../../../db/models/auth/Users'
import { findSrpChallenge, cleanupSrpChallenge } from '../../../redis/srp'
import { Session as SrpSession } from 'secure-remote-password/server'
import { setJwtCookies } from '../../../auth/cookies'
import { App } from '../../../types'
import {
  AuthClaims,
  Plans,
  TwoFactorStatus,
  maxAgeInSeconds,
  getExpirationDate
} from '../../../exports/defs'
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
        app.redis,
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
        await cleanupSrpChallenge(app.redis, userID, challengeID)
      } catch (error) {
        req.log.error({ msg: 'SRP login response failure', error })
        throw app.httpErrors.unauthorized('Incorrect username or password')
      }

      const twoFactorRequired =
        user.twoFactorStatus === TwoFactorStatus.verified

      const now = new Date()
      const claims: AuthClaims = {
        tokenID: nanoid(),
        userID,
        plan: Plans.free, // todo: Pull from user entry in database
        twoFactorStatus: twoFactorRequired
          ? TwoFactorStatus.enabled // Will need to be verified
          : TwoFactorStatus.disabled,
        sessionExpiresAt: getExpirationDate(maxAgeInSeconds.session, now)
      }
      setJwtCookies(claims, res, now)

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
