import { hashString } from './hash'

describe('crypto/primitives/hash', () => {
  test('hashString - test vectors', async () => {
    // https://www.di-mgt.com.au/sha_testvectors.html
    expect(await hashString('', 'utf8', 'hex')).toEqual(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    )
    expect(await hashString('abc', 'utf8', 'hex')).toEqual(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    )
    expect(
      await hashString(
        'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
        'utf8',
        'hex'
      )
    ).toEqual(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'
    )
  })

  test('hashString - utf8 to base64', async () => {
    const received = await hashString('Hello, world!', 'utf8', 'base64')
    const expected = 'MV9b23bQeMQ7isAGTkoBZGErH853yGk0W_yUx1iU7dM='
    expect(received).toEqual(expected)
  })

  test('hashString - utf8 to hex', async () => {
    const received = await hashString('Hello, world!', 'utf8', 'hex')
    const expected =
      '315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3'
    expect(received).toEqual(expected)
  })

  test('hashString - hex to base64', async () => {
    const received = await hashString(
      'cafebabedeadf00dbaadf00dfacade42',
      'hex',
      'base64'
    )
    const expected = 'w1YlJBG8PjryCjkZCPwgWj-FHL_KoHr7rG7Ts-MprMc='
    expect(received).toEqual(expected)
  })

  test('hashString - hex to hex', async () => {
    const received = await hashString(
      'cafebabedeadf00dbaadf00dfacade42',
      'hex',
      'hex'
    )
    const expected =
      'c356252411bc3e3af20a391908fc205a3f851cbfcaa07afbac6ed3b3e329acc7'
    expect(received).toEqual(expected)
  })

  test('hashString - base64 to base64', async () => {
    const received = await hashString(
      'someRandom_base64-urlencoded-string',
      'base64',
      'base64'
    )
    const expected = '_nO5yin5xwE42KroU5DKdbQe4t6IvslBcv9PUX62xMY='
    expect(received).toEqual(expected)
  })

  test('hashString - base64 to hex', async () => {
    const received = await hashString(
      'someRandom_base64-urlencoded-string',
      'base64',
      'hex'
    )
    const expected =
      'fe73b9ca29f9c70138d8aae85390ca75b41ee2de88bec94172ff4f517eb6c4c6'
    expect(received).toEqual(expected)
  })
})
