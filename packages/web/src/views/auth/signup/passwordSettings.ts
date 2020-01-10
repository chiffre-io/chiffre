// Settings
export const PASSWORD_MIN_LENGTH = 8

export enum PasswordStrength {
  pwned = -1,
  empty = 0,
  tooShort,
  weak,
  good,
  strong
}
