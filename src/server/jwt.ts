import jsonwebtoken, { SignOptions } from 'jsonwebtoken'
import serverConfig from './env'

export interface JwtClaims {
  userID: string
  sessionID: string
  sessionExpiresAt: Date
}

interface JwtPayload {
  sub: string // User ID
  sid: string // Session ID
  exp: number // UTC seconds since epoch
}

const claimsToPayload = (claims: JwtClaims): JwtPayload => ({
  sub: claims.userID,
  sid: claims.sessionID,
  exp: Math.floor(claims.sessionExpiresAt.getTime() / 1000)
})

const payloadToClaims = (payload: JwtPayload): JwtClaims => ({
  userID: payload.sub,
  sessionID: payload.sid,
  sessionExpiresAt: new Date(payload.exp * 1000)
})

// --

export const createJwt = (claims: JwtClaims) => {
  const payload = claimsToPayload(claims)
  const secretKey = serverConfig.JWT_SECRET
  const options: SignOptions = {
    algorithm: 'HS256',
    issuer: serverConfig.JWT_ISSUER
  }
  return jsonwebtoken.sign(payload, secretKey, options)
}

// --

export const verifyJwt = (jwt: string): JwtClaims => {
  const payload = jsonwebtoken.verify(jwt, serverConfig.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: serverConfig.JWT_ISSUER
  }) as JwtPayload
  return payloadToClaims(payload)
}

// --

// Can only be used on the front-end to access the JWT contents.
// On the back-end, use verifyJwt for extra security.
export const extractJwtClaims = (jwt: string): JwtClaims => {
  const [_header, payloadBase64, _sig] = jwt.split('.')
  const payloadJson = window.btoa(payloadBase64)
  const payload: JwtPayload = JSON.parse(payloadJson)
  return payloadToClaims(payload)
}
