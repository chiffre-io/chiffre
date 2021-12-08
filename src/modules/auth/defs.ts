import type { Plans } from 'modules/business/defs'

export enum TwoFactorStatus {
  /**
   * Two Factor Authentication is not in use for this account
   */
  disabled = 'disabled',

  /**
   * Intermediary state where 2FA has to be verified first
   * Used when enabling 2FA or when logging in for users who
   * have 2FA activated.
   * Must only be accepted in auth parameters by endpoints
   * in charge of 2FA verification, and transition to `verified`
   * upon success.
   */
  enabled = 'enabled',

  /**
   * Two Factor Authentication in use and verified for the session.
   */
  verified = 'verified'
}

export interface AuthClaims {
  userID: string
  tokenID: string
  plan: Plans
  twoFactorStatus: TwoFactorStatus
  sessionExpiresAt: Date
}

export enum CookieNames {
  jwt = 'chiffre:jwt',
  sig = 'chiffre:sig'
}
