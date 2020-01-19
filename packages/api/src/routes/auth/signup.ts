import nanoid from 'nanoid'
import { App } from '../../types'
import { createUser } from '../../db/models/auth/Users'
import { setJwtCookies } from '../../auth/cookies'
import {
  AuthClaims,
  Plans,
  TwoFactorStatus,
  maxAgeInSeconds,
  getExpirationDate
} from '../../exports/defs'
import { createKeychainRecord } from '../../db/models/entities/Keychains'
import { logEvent, EventTypes } from '../../db/models/business/Events'
import { signupParametersSchema, SignupParameters } from './signup.schema'
import { base64ToHex } from '@47ng/codec'

// --

export default async (app: App) => {
  app.post<unknown, unknown, unknown, SignupParameters>(
    '/auth/signup',
    {
      schema: {
        body: signupParametersSchema,
        summary: 'Create an account on the service',
        description: `
We use SRP for authentication, because passwords cannot be sent to the server,
as they are used for master key derivation.

At signup time, we register the SRP salt and verifier, along with a few other
local entities that will be needed later for authenticating on other devices:

• Username, that identifies the user (must be unique)
• Master salt, used to derive the master key (with PBKDF2)
• Keychain info`
      }
    },
    async function createUserHandler(req, res) {
      const {
        username,
        srpSalt,
        srpVerifier,
        masterSalt,
        keychain,
        keychainKey
      } = req.body

      try {
        // Perform a mock SRP check of the supplied data to avoid storing junk
        if (srpVerifier.length !== 344 || srpSalt.length !== 44) {
          throw new Error('Invalid SRP parameters')
        }
        base64ToHex(srpVerifier)
      } catch (error) {
        throw app.httpErrors.unprocessableEntity('Invalid SRP parameters')
      }

      try {
        // todo: Pack all operations into a transaction
        const { id: userID } = await createUser(app.db, {
          username,
          srpSalt,
          srpVerifier,
          masterSalt
        })
        await createKeychainRecord(app.db, {
          userID,
          key: keychainKey,
          signaturePublicKey: keychain.signature.public,
          signatureSecretKey: keychain.signature.secret,
          sharingPublicKey: keychain.sharing.public,
          sharingSecretKey: keychain.sharing.secret
        })

        const now = new Date()
        const claims: AuthClaims = {
          tokenID: nanoid(),
          userID,
          plan: Plans.free, // Default plan
          twoFactorStatus: TwoFactorStatus.disabled,
          sessionExpiresAt: getExpirationDate(maxAgeInSeconds.session, now)
        }
        setJwtCookies(claims, res, now)
        await logEvent(app.db, EventTypes.signup, { ...req, auth: claims })
        return res.status(201).send() // Created
      } catch (error) {
        if (error.code === '23505') {
          // duplicate key value violates unique constraint
          throw app.httpErrors.conflict('This username is not available')
        }
        req.log.error(error)
        throw error
      }
    }
  )
}
