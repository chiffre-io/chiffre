import S from 'fluent-schema'

export interface LoginChallengeParameters {
  username: string
}

export const loginChallengeParametersSchema = S.object().prop(
  'username',
  S.string().required()
)

// --

export interface LoginChallengeResponseBody {
  userID: string
  challengeID: string
  srpSalt: string
  ephemeral: string
}
