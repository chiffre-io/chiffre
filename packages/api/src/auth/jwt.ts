import jwt from 'jsonwebtoken'
import { AuthClaims, Plans, TwoFactorStatus } from '../exports/defs'

interface Payload {
  sub: string
  jti: string
  exp: number
  plan: Plans
  '2fa': TwoFactorStatus
}

export function createJwt(claims: AuthClaims, now: Date) {
  const signOptions: jwt.SignOptions = {
    algorithm: 'HS512',
    issuer: process.env.JWT_ISSUER,
    jwtid: claims.tokenID,
    subject: claims.userID,
    expiresIn: (claims.sessionExpiresAt.getTime() - now.getTime()) / 1000
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
    plan: payload.plan,
    userID: payload.sub,
    tokenID: payload.jti,
    twoFactorStatus: payload['2fa'],
    sessionExpiresAt: new Date(payload.exp)
  }
}
