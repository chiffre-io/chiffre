import { NextApiResponse } from 'next'
import nextConnect from 'next-connect'
import requireBodyParams, {
  requiredString
} from '~/src/server/middleware/requireBodyParams'
import database, { Db } from '~/src/server/middleware/database'
import { Request } from '~/src/server/types'
import { verifyTotpToken } from '~/src/server/2fa'
import { findUser } from '~/src/server/db/models/auth/UsersAuthSRP'
import { findSession } from '~/src/server/db/models/auth/Sessions'
import { createJwt } from '~/src/server/jwt'
import { markTotpVerifiedInSession } from '../../../../src/server/db/models/auth/Sessions'

export interface Login2FAParameters {
  userID: string
  sessionID: string
  totpToken: string
}

export interface Login2FAResponseBody {
  jwt: string
}

// --

const handler = nextConnect()

handler.use(
  requireBodyParams<Login2FAParameters>({
    userID: requiredString,
    sessionID: requiredString,
    totpToken: requiredString
  })
)
handler.use(database)

handler.post(
  async (req: Request<Db, Login2FAParameters>, res: NextApiResponse) => {
    const { userID, sessionID, totpToken } = req.body

    const user = await findUser(req.db, userID)
    if (!user) {
      return res.status(404).json({
        error: `User not found`
      })
    }
    const session = await findSession(req.db, sessionID)
    if (!session) {
      return res.status(404).json({
        error: `Session not found`
      })
    }

    if (session.totpVerified) {
      // The session is already verified
      // todo: Then what ?
    }

    const verified = verifyTotpToken(
      totpToken,
      'X6NU5UDZGPDHWW5H32WJSRYHOU55TPVBMZGZHXC67UUS4CUHQAGA'
    )
    if (!verified) {
      return res.status(401).json({
        error: `Invalid TOTP code`
      })
    }

    await markTotpVerifiedInSession(req.db, session.id)

    const jwt = createJwt({
      userID: user.id,
      sessionID: session.id,
      expiresAt: session.expiresAt
    })

    const body: Login2FAResponseBody = {
      jwt
    }
    res.json(body)
  }
)
handler.use((err, req, res, next) => {
  console.error(err)
})

export default handler
