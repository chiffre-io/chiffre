import { b64, utf8 } from './codec'
import nacl from 'tweetnacl'

describe('Codecs', () => {
  test('Base64', () => {
    const expected = nacl.randomBytes(42)
    const received = b64.decode(b64.encode(expected))
    expect(received).toEqual(expected)
  })

  test('UTF-8', () => {
    const expected = 'Hello, world ! 👋🌍'
    const received = utf8.decode(utf8.encode(expected))
    expect(received).toEqual(expected)
  })
})
