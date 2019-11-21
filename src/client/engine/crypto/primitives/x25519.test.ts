import nacl from 'tweetnacl'
import {
  XCipherText,
  serializeXCipherText,
  deserializeXCipherText,
  generateNonce
} from './x25519'

describe('TweetNaCl x25519-xsalsa20-poly1305', () => {
  test('nonce', () => {
    const expected = generateNonce()
    expect(expected).toHaveLength(24)
  })

  test('serde symmetry', () => {
    const expected: XCipherText = {
      nonce: nacl.randomBytes(nacl.box.nonceLength),
      text: nacl.randomBytes(42)
    }
    const received = deserializeXCipherText(serializeXCipherText(expected))
    expect(received).toEqual(expected)
  })
})
