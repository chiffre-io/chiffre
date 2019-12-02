import { Session } from './db/models/auth/Sessions'

export enum CookieNames {
  jwt = 'chiffre:jwt'
}

export const createJwtCookie = (jwt: string, session: Session) => {
  return [
    `${CookieNames.jwt}=${jwt}`,
    'Path=/',
    `Max-Age=${(session.expiresAt.getTime() - Date.now()) / 1000}`,
    'HttpOnly',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
    'SameSite=Strict'
  ]
    .filter(x => !!x)
    .join('; ')
}
