import S from 'fluent-schema'
import { Keychain } from '@chiffre/crypto-client'

export interface SignupParameters {
  username: string
  displayName: string
  srpSalt: string
  srpVerifier: string
  masterSalt: string
  keychainKey: string
  keychain: Keychain
}

export const signupParametersSchema = S.object()
  .prop('username', S.string().required())
  .prop('displayName', S.string().required())
  .prop('srpSalt', S.string().required())
  .prop('srpVerifier', S.string().required())
  .prop('masterSalt', S.string().required())
  .prop('keychainKey', S.string().required())
  .prop(
    'keychain',
    S.object()
      .required()
      .prop(
        'signature',
        S.object()
          .required()
          .prop('public', S.string().required())
          .prop('secret', S.string().required())
      )
      .prop(
        'sharing',
        S.object()
          .required()
          .prop('public', S.string().required())
          .prop('secret', S.string().required())
      )
  )
