import jwt from 'jsonwebtoken'
import { AuthClaims, Plans, TwoFactorStatus } from './types'

interface Payload {
  sub: string
  plan: Plans
  jti: string
  '2fa': TwoFactorStatus
}

interface CreateJwtOptions {
  expiresIn?: string
}

export const createJwt = (
  claims: AuthClaims,
  options: CreateJwtOptions = {}
) => {
  const signOptions: jwt.SignOptions = {
    algorithm: 'HS512',
    issuer: process.env.JWT_ISSUER,
    jwtid: claims.tokenID,
    subject: claims.userID
  }
  if (options.expiresIn) {
    signOptions.expiresIn = options.expiresIn
  }

  const token = jwt.sign(
    {
      plan: claims.plan,
      '2fa': claims.twoFactorStatus
    },
    process.env.JWT_SECRET,
    signOptions
  )
  return token
}

export function verifyJwt(token: string): AuthClaims {
  const payload = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS512'],
    issuer: process.env.JWT_ISSUER
  }) as Payload
  return {
    userID: payload.sub,
    tokenID: payload.jti,
    plan: payload.plan,
    twoFactorStatus: payload['2fa']
  }
}
