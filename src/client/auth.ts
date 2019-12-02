import { CookieNames } from '~/src/server/cookies'

export const saveLoginCredentials = (jwt: string) => {
  window.localStorage.setItem(CookieNames.jwt, jwt)
}

export const clearLoginCredentials = () => {
  window.localStorage.removeItem(CookieNames.jwt)
}

export const getLoginCredentials = () => {
  return window.localStorage.getItem(CookieNames.jwt)
}
