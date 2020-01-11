import nanoid from 'nanoid'
import {
  findLoginChallenge,
  isChallengeExpired
} from '../../../db/models/auth/LoginChallengesSRP'
import { serverLoginResponse } from '../../../auth/srp'
import { deleteLoginChallenge } from '../../../db/models/auth/LoginChallengesSRP'
import { findUser } from '../../../db/models/auth/Users'
import { Session as SrpSession } from 'secure-remote-password/server'
import { setJwtCookies } from '../../../auth/cookies'
import { App } from '../../../types'
import { AuthClaims, Plans, TwoFactorStatus } from '../../../auth/types'
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

      const challenge = await findLoginChallenge(app.db, challengeID)
      if (!challenge) {
        throw app.httpErrors.notFound('Invalid challenge ID')
      }
      if (challenge.userID !== userID) {
        throw app.httpErrors.forbidden('Invalid user for this challenge')
      }

      if (isChallengeExpired(challenge)) {
        try {
          await deleteLoginChallenge(app.db, challenge.id)
        } catch (error) {
          req.log.error({ msg: 'Failed to cleanup expired challenge', error })
        }
        throw app.httpErrors.requestTimeout('Challenge response timeout')
      }

      const user = await findUser(app.db, userID)
      if (!user) {
        throw app.httpErrors.notFound('User not found')
      }

      let srpSession: SrpSession = null
      try {
        srpSession = serverLoginResponse(
          challenge.ephemeralSecret,
          clientEphemeral,
          user.srpSalt,
          user.username,
          user.srpVerifier,
          clientProof
        )
      } catch (error) {
        req.log.error({ msg: 'SRP login response failure', error })
        throw app.httpErrors.unauthorized('Incorrect username or password')
      } finally {
        // Cleanup
        await deleteLoginChallenge(app.db, challenge.id)
      }

      const twoFactorRequired =
        user.twoFactorStatus === TwoFactorStatus.verified

      const claims: AuthClaims = {
        tokenID: nanoid(),
        userID,
        plan: Plans.free, // todo: Pull from user entry in database
        twoFactorStatus: twoFactorRequired
          ? TwoFactorStatus.enabled // Will need to be verified
          : TwoFactorStatus.disabled
      }
      setJwtCookies(claims, res)
      req.log.info({ msg: 'Login response', auth: claims })

      const masterSalt = twoFactorRequired ? undefined : user.masterSalt

      const body: LoginResponseResponseBody = {
        proof: srpSession.proof,
        masterSalt
      }
      return res.send(body)
    }
  )
}
