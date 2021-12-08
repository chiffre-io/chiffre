import { assembleSecret, splitSecret } from './tss'

describe('crypto/tss', () => {
  test('split & recompose', () => {
    const secret = 'super secret'
    const shards = splitSecret(secret, 2, 2)
    const received = assembleSecret(shards)
    expect(received).toEqual(secret)
  })

  test('secret encoded in base64', () => {
    const secret = 'SGVsbG8sIHdvcmxkIQ==' // Hello, world!
    const shards = splitSecret(secret, 2, 2, 'base64')
    const received = assembleSecret(shards, 'base64')
    expect(received).toEqual(secret)
  })

  test('secret encoded in hexadecimal', () => {
    const secret = 'baadf00dcafebabefacade42'
    const shards = splitSecret(secret, 2, 2, 'hex')
    const received = assembleSecret(shards, 'hex')
    expect(received).toEqual(secret)
  })

  test('failure - not enough shards', () => {
    // Split into 4, require 3, provide 2
    const secret = 'super secret'
    const [shard1, shard2] = splitSecret(secret, 4, 3)
    const run = () => assembleSecret([shard1, shard2])
    expect(run).toThrow()
  })

  test('failure - wrong shard', () => {
    const secret = 'super secret'
    const [shard1] = splitSecret(secret, 2, 2)
    const run = () => assembleSecret([shard1, 'foo bar egg spam'])
    expect(run).toThrow()
  })
})
