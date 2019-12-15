import { Session } from './db/models/auth/Sessions'
import serverRuntimeConfig from '~/src/server/env'

export enum CookieNames {
  jwt = 'chiffre:jwt'
}

// Allow overriding for local non-https testing of production builds
const secureCookies =
  process.env.NODE_ENV === 'production' &&
  serverRuntimeConfig.LOCAL_INSECURE_COOKIES !== 'true'

export const createJwtCookie = (jwt: string, session: Session) => {
  return [
    `${CookieNames.jwt}=${jwt}`,
    'Path=/',
    `Max-Age=${(session.expiresAt.getTime() - Date.now()) / 1000}`,
    'HttpOnly',
    secureCookies ? 'Secure' : null,
    'SameSite=Strict'
  ]
    .filter(x => !!x)
    .join('; ')
}
