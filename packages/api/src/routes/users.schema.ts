import S from 'fluent-schema'

export interface GetUserQuery {
  username: string
}

export const getUserQuerySchema = S.object().prop(
  'username',
  S.string().required()
)

// --

export interface UserResponse {
  userID: string
  username: string
  signaturePublicKey: string
  sharingPublicKey: string
}

export const userResponseSchema = S.object()
  .prop('userID', S.string())
  .prop('username', S.string())
  .prop('signaturePublicKey', S.string())
  .prop('sharingPublicKey', S.string())
