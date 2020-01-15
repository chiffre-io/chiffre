import S from 'fluent-schema'

export interface CreateVaultParameters {
  key: string
}

export const createVaultParametersSchema = S.object().prop(
  'key',
  S.string().required()
)

export interface CreateVaultResponse {
  vaultID: string
}

export const createVaultResponseSchema = S.object().prop('vaultID', S.string())

// --

export interface FindVaultUrlParams {
  vaultID: string
}

export const findVaultUrlParamsSchema = S.object().prop(
  'vaultID',
  S.string().required()
)

export interface FindVaultResponse {
  vaultID: string
  createdBy: string
  key: string
  // todo: Add members info (id, joinedAt)
}

export const findVaultResponseSchema = S.object()
  .prop('vaultID', S.string())
  .prop('createdBy', S.string())
  .prop('key', S.string())
