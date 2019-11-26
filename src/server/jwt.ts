import jsonwebtoken, { SignOptions } from 'jsonwebtoken'
import serverConfig from './env'

export interface CreateJwtArgs {
  userID: string
  sessionID: string
  expiresAt: Date
}

export const createJwt = (args: CreateJwtArgs) => {
  const payload = {
    sub: args.userID,
    sid: args.sessionID,
    exp: Math.floor(args.expiresAt.getTime() / 1000)
  }
  const secretKey = serverConfig.JWT_SECRET
  const options: SignOptions = {
    algorithm: 'HS256',
    issuer: serverConfig.JWT_ISSUER
  }
  return jsonwebtoken.sign(payload, secretKey, options)
}
