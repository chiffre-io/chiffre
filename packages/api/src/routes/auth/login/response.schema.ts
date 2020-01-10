import S from 'fluent-schema'

export interface LoginResponseParameters {
  userID: string
  challengeID: string
  ephemeral: string
  proof: string
}

export const loginResponseParametersSchema = S.object()
  .prop('userID', S.string().required())
  .prop('challengeID', S.string().required())
  .prop('ephemeral', S.string().required())
  .prop('proof', S.string().required())

// --

export interface LoginResponseResponseBody {
  proof: string
  masterSalt?: string
}
