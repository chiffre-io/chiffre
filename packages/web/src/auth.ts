import { AuthClaims } from '@chiffre/api'

export const saveLoginCredentials = (claims: AuthClaims) => {
  window.localStorage.setItem('chiffre:auth', JSON.stringify(claims))
}

export const clearLoginCredentials = () => {
  window.localStorage.removeItem('chiffre:auth')
}

export const getLoginCredentials = (): AuthClaims | null => {
  try {
    const json = window.localStorage.getItem('chiffre:auth')
    if (!json) {
      throw new Error('Not authenticated')
    }
    return JSON.parse(json, (key, value) =>
      key === 'sessionExpiresAt' ? new Date(value) : value
    )
  } catch {
    return null
  }
}
