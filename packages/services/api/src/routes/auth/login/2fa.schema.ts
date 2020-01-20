import S from 'fluent-schema'

export interface Login2FAParameters {
  twoFactorToken: string
}

export const login2FAParametersSchema = S.object().prop(
  'twoFactorToken',
  S.string().required()
)

// --

export interface Login2FAResponseBody {
  masterSalt: string
}
