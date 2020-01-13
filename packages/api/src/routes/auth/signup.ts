import nanoid from 'nanoid'
import { App } from '../../types'
import { createUser } from '../../db/models/auth/Users'
import { setJwtCookies } from '../../auth/cookies'
import { AuthClaims, Plans, TwoFactorStatus } from '../../auth/types'
import { createKeychainRecord } from '../../db/models/entities/Keychains'
import { signupParametersSchema, SignupParameters } from './signup.schema'
import { base64ToHex } from '@47ng/codec'

// --

export default async (app: App) => {
  app.post<unknown, unknown, unknown, SignupParameters>(
    '/auth/signup',
    {
      schema: {
        body: signupParametersSchema
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
        // Perform an SRP check of the supplied data to avoid storing junk
        serverLoginChallenge(srpVerifier)
      } catch (error) {
        throw app.httpErrors.unprocessableEntity('Invalid SRP parameters')
      }

      try {
        // todo: Pack all operations into a transaction
        const { id: userID } = await createUser(app.db, {
          username,
          srpSalt,
          srpVerifier,
          masterSalt,
          twoFactorStatus: TwoFactorStatus.disabled
        })
        await createKeychainRecord(app.db, {
          userID,
          key: keychainKey,
          signaturePublicKey: keychain.signature.public,
          signatureSecretKey: keychain.signature.secret,
          sharingPublicKey: keychain.sharing.public,
          sharingSecretKey: keychain.sharing.secret
        })

        const claims: AuthClaims = {
          tokenID: nanoid(),
          userID,
          plan: Plans.free, // Default plan
          twoFactorStatus: TwoFactorStatus.disabled
        }

        setJwtCookies(claims, res)
        req.log.info({ msg: 'Account created', auth: claims })
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
