import S from 'fluent-schema'

export interface TwoFactorVerifyParameters {
  twoFactorToken: string
}

export const twoFactorVerifyParametersSchema = S.object().prop(
  'twoFactorToken',
  S.string().required()
)

// --

export interface TwoFactorVerifyResponse {
  backupCodes: string[]
}
