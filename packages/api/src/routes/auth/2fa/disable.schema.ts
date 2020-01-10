import S from 'fluent-schema'

export interface TwoFactorDisableParameters {
  twoFactorToken: string
}

export const twoFactorDisableParametersSchema = S.object().prop(
  'twoFactorToken',
  S.string().required()
)
