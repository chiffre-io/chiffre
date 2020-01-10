import {
  createMasterKey,
  deriveMasterKey,
  createMasterKeyFromToken,
  deriveMasterKeyFromToken,
  recomposeMasterKeyFromShards
} from './masterKey'

describe('Master key', () => {
  test('Derivation', async () => {
    const { masterSalt, masterKey } = await createMasterKey(
      'username',
      'password'
    )
    const derived = await deriveMasterKey('username', 'password', masterSalt)
    expect(derived).toEqual(masterKey)
  })

  test('Tokens', async () => {
    const { masterKey, masterSalt } = await createMasterKeyFromToken('token')
    const derived = await deriveMasterKeyFromToken('token', masterSalt)
    expect(derived).toEqual(masterKey)
  })

  test('Shards', async () => {
    const { masterKey, shards } = await createMasterKey('username', 'password')
    const recomposed = recomposeMasterKeyFromShards(shards)
    expect(recomposed).toEqual(masterKey)
  })
})
