import { Session } from './db/models/auth/Sessions'
import serverRuntimeConfig from '~/src/server/env'

export enum CookieNames {
  sid = 'chiffre:sid'
}

// Allow overriding for local non-https testing of production builds
const secureCookies =
  process.env.NODE_ENV === 'production' &&
  serverRuntimeConfig.LOCAL_INSECURE_COOKIES !== 'true'

export const createSessionIDCookie = (session: Session, now = Date.now()) => {
  return [
    `${CookieNames.sid}=${session.id}`,
    'Path=/',
    `Max-Age=${(session.expiresAt.getTime() - now) / 1000}`,
    'HttpOnly',
    secureCookies ? 'Secure' : null,
    'SameSite=Strict'
  ]
    .filter(x => !!x)
    .join('; ')
}
