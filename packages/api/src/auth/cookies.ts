import { FastifyReply } from 'fastify'
import { AuthClaims } from './types'
import { createJwt } from './jwt'

// https://medium.com/lightrail/getting-token-authentication-right-in-a-stateless-single-page-application-57d0c6474e3

export enum CookieNames {
  jwt = 'chiffre:jwt-claims',
  sig = 'chiffre:jwt-sig'
}

// --

export function setJwtCookies(claims: AuthClaims, res: FastifyReply<any>) {
  const token = createJwt(claims, { expiresIn: '7d' })
  const [header, payload, signature] = token.split('.')

  // Allow overriding for local non-https testing of production builds
  const secure =
    process.env.NODE_ENV !== 'development' &&
    process.env.LOCAL_INSECURE_COOKIES !== 'true'

  res.setCookie(CookieNames.jwt, [header, payload].join('.'), {
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    sameSite: 'strict',
    secure,
    httpOnly: false // Accessible in the front-end via JS
  })
  res.setCookie(CookieNames.sig, signature, {
    path: '/',
    sameSite: 'strict',
    secure,
    httpOnly: true // Hidden to the front-end
  })
}