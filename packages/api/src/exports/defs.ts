export enum Plans {
  free = 'free',
  recurring = 'recurring', // Recurring billing per month or per year
  usage = 'usage', // Pay for what you use
  perpetual = 'perpetual', // Pay once, own forever
  unlimited = 'unlimited' // Internal, no limits, for friends & family
}

export const allPlans: Plans[] = [
  Plans.free,
  Plans.recurring,
  Plans.usage,
  Plans.perpetual,
  Plans.unlimited
]

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
}

export enum CookieNames {
  jwt = 'chiffre:jwt',
  sig = 'chiffre:sig'
}

export const maxAgeInSeconds = {
  session: 7 // * 24 * 60 * 60 // 7 days
}

export function getExpirationDate(
  maxAgeSeconds: number,
  now: Date = new Date()
): Date {
  return new Date(now.getTime() + maxAgeSeconds * 1000)
}
