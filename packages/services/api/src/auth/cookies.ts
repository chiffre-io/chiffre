import { FastifyReply } from 'fastify'
import { AuthClaims, CookieNames, maxAgeInSeconds } from '../exports/defs'
import { createJwt } from './jwt'

// https://medium.com/lightrail/getting-token-authentication-right-in-a-stateless-single-page-application-57d0c6474e3

// --

export function setJwtCookies(claims: AuthClaims, res: FastifyReply<any>) {
  const token = createJwt(claims)
  const [header, payload, signature] = token.split('.')

  // Allow overriding for local non-https testing of production builds
  const secure =
    process.env.NODE_ENV !== 'development' &&
    process.env.CHIFFRE_API_INSECURE_COOKIES !== 'true'

  res.setCookie(CookieNames.jwt, [header, payload].join('.'), {
    domain: process.env.NODE_ENV === 'production' ? '.chiffre.io' : undefined,
    path: '/',
    expires: claims.sessionExpiresAt,
    sameSite: 'lax',
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

export function clearJwtCookies(res: FastifyReply<any>) {
  // Allow overriding for local non-https testing of production builds
  const secure =
    process.env.NODE_ENV !== 'development' &&
    process.env.CHIFFRE_API_INSECURE_COOKIES !== 'true'

  res.clearCookie(CookieNames.jwt, {
    domain: process.env.NODE_ENV === 'production' ? '.chiffre.io' : undefined,
    path: '/',
    sameSite: 'lax',
    secure,
    httpOnly: false // Accessible in the front-end via JS
  })
  res.clearCookie(CookieNames.sig, {
    path: '/',
    sameSite: 'strict',
    secure,
    httpOnly: true // Hidden to the front-end
  })
}
