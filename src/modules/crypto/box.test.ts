import {
  decryptString,
  encryptString,
  generateKeys,
  importKeys,
  parsePublicKey,
  parseSecretKey,
  publicKeyRegex,
  sealedBoxRegex,
  secretKeyRegex
} from './box'

describe('crypto/box', () => {
  test('regex', () => {
    const keys = generateKeys()

    expect(keys.public).toMatch(publicKeyRegex)
    expect(keys.secret).toMatch(secretKeyRegex)
    expect(keys.public).not.toMatch(secretKeyRegex)
    expect(keys.secret).not.toMatch(publicKeyRegex)
    const message = encryptString('', keys.raw.publicKey)
    expect(message).toMatch(sealedBoxRegex)
  })

  test('generate keys', () => {
    const keys = generateKeys()
    expect(parsePublicKey(keys.public)).toEqual(keys.raw.publicKey)
    expect(parseSecretKey(keys.secret)).toEqual(keys.raw.secretKey)
    const copy = importKeys(keys.secret)
    expect(keys.public).toEqual(copy.public)
    expect(keys.secret).toEqual(copy.secret)
    expect(keys.public).not.toEqual(copy.secret)
    expect(keys.secret).not.toEqual(copy.public)
    expect(keys.raw.publicKey).toEqual(copy.raw.publicKey)
    expect(keys.raw.secretKey).toEqual(copy.raw.secretKey)
    expect(keys.raw.publicKey).not.toEqual(copy.raw.secretKey)
    expect(keys.raw.secretKey).not.toEqual(copy.raw.publicKey)
  })

  test('codec', () => {
    const keys = generateKeys()
    const expected = 'Hello, World !'
    const message = encryptString(expected, keys.raw.publicKey)
    const received = decryptString(message, keys.raw.secretKey)
    expect(received).toEqual(expected)
  })

  test('Known test vector', () => {
    const secretKey = 'sk._dI3REFDpIehLTNV1_v-1qp0woWqvY66Xw4UXdFAJI8'
    const message =
      'v1.naclbox.Eu6k3DshffqkRnqhtCFfZA4SCzgrxqXX6GeY1LbBZT0=.utf8.LQ6atta_ET_-jLN2aLpKNIa35bDhxRum.ivrW2XNVK0_5Fc27oZpG3_onzX2U4Gg52oTbcEhN'
    const keys = importKeys(secretKey)
    const expected = 'Hello, World !'
    const received = decryptString(message, keys.raw.secretKey)
    expect(received).toEqual(expected)
  })

  test('Known test vector, no padding', () => {
    const secretKey = 'sk._dI3REFDpIehLTNV1_v-1qp0woWqvY66Xw4UXdFAJI8'
    const message =
      'v1.naclbox.Eu6k3DshffqkRnqhtCFfZA4SCzgrxqXX6GeY1LbBZT0.utf8.LQ6atta_ET_-jLN2aLpKNIa35bDhxRum.ivrW2XNVK0_5Fc27oZpG3_onzX2U4Gg52oTbcEhN'
    const keys = importKeys(secretKey)
    const expected = 'Hello, World !'
    const received = decryptString(message, keys.raw.secretKey)
    expect(received).toEqual(expected)
  })

  // Failure cases --

  test('Invalid public key parsing', () => {
    const run = () => parsePublicKey('not a public key')
    expect(run).toThrowError('Invalid public key format')
  })

  test('Invalid secret key parsing', () => {
    const run = () => parseSecretKey('not a secret key')
    expect(run).toThrowError('Invalid secret key format')
  })

  test('Invalid secret key parsing', () => {
    const run = () => parseSecretKey('not a secret key')
    expect(run).toThrowError('Invalid secret key format')
  })

  test('Import keys from invalid secret key', () => {
    const run = () => importKeys('not a secret key')
    expect(run).toThrowError('Invalid secret key format')
  })

  test('Decrypt message from wrong secret key', () => {
    const secretKey = 'sk.thisisnotthecorrectsecretkeyforthismessage_'
    const message =
      'v1.naclbox.Eu6k3DshffqkRnqhtCFfZA4SCzgrxqXX6GeY1LbBZT0.utf8.LQ6atta_ET_-jLN2aLpKNIa35bDhxRum.ivrW2XNVK0_5Fc27oZpG3_onzX2U4Gg52oTbcEhN'
    const keys = importKeys(secretKey)
    const run = () => decryptString(message, keys.raw.secretKey)
    expect(run).toThrowError('Failed to decrypt message')
  })

  test('Decrypt message with invalid format', () => {
    const secretKey = 'sk._dI3REFDpIehLTNV1_v-1qp0woWqvY66Xw4UXdFAJI8'
    const message = 'not an actual message'
    const keys = importKeys(secretKey)
    const run = () => decryptString(message, keys.raw.secretKey)
    expect(run).toThrowError('Unsupported format or algorithm')
  })
})
