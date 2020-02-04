import S from 'fluent-schema'

export interface TwoFactorVerifyParameters {
  twoFactorToken: string
  clientTime: number
}

export const twoFactorVerifyParametersSchema = S.object()
  .prop('twoFactorToken', S.string().required())
  .prop('clientTime', S.number().required())

// --

export interface TwoFactorVerifyResponse {
  backupCodes: string[]
}
