import S from 'fluent-schema'

export interface Login2FAParameters {
  twoFactorToken: string
  clientTime: number
}

export const login2FAParametersSchema = S.object()
  .prop('twoFactorToken', S.string().required())
  .prop('clientTime', S.number().required())

// --

export interface Login2FAResponseBody {
  masterSalt: string
}
