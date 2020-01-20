import nanoid from 'nanoid'
import { AuthClaims, getExpirationDate, maxAgeInSeconds } from '../exports/defs'

export function makeClaims(
  claims: Omit<AuthClaims, 'tokenID' | 'sessionExpiresAt'>
): AuthClaims {
  return {
    tokenID: nanoid(),
    ...claims,
    sessionExpiresAt: getExpirationDate(maxAgeInSeconds.session)
  }
}

export function updateClaims(
  oldClaims: AuthClaims,
  newClaims: Partial<AuthClaims>
): AuthClaims {
  return {
    ...oldClaims,
    ...newClaims,
    // Refresh expiration time
    sessionExpiresAt: getExpirationDate(maxAgeInSeconds.session)
  }
}
