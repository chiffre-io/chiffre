import S from 'fluent-schema'

export interface TwoFactorDisableParameters {
  twoFactorToken: string
  clientTime: number
}

export const twoFactorDisableParametersSchema = S.object()
  .prop('twoFactorToken', S.string().required())
  .prop('clientTime', S.number().required())
