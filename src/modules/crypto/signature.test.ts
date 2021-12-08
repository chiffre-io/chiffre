import {
  generateKeys,
  importKeys,
  parsePublicKey,
  parseSecretKey,
  publicKeyRegex,
  secretKeyRegex,
  signatureRegex,
  signUtf8String,
  verifySignature
} from './signature'

describe('crypto/signature', () => {
  test('regex', () => {
    const keys = generateKeys()
    expect(keys.public).toMatch(publicKeyRegex)
    expect(keys.secret).toMatch(secretKeyRegex)
    expect(keys.public).not.toMatch(secretKeyRegex)
    expect(keys.secret).not.toMatch(publicKeyRegex)
    const message = signUtf8String('', keys.raw.secretKey)
    expect(message).toMatch(signatureRegex)
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
    const signature = signUtf8String(expected, keys.raw.secretKey)
    const received = verifySignature(signature, keys.raw.publicKey)
    expect(received).toEqual(expected)
  })

  test('Known test vector', () => {
    const secretKey =
      'ssk.IPwaySrr89g2ymWBrqC81qk7NCmenVN_gFmiz9gtAuTWGhwBv-mSUWbFeS9Zk00Iir8z2GM5Eue4v39FEpOiFw'
    const publicKey = 'spk.1hocAb_pklFmxXkvWZNNCIq_M9hjORLnuL9_RRKTohc'
    const message =
      'v1.naclsig.5InC2t-TYSFwIFOv-M2nY2zvPYD_ZVExkUqx3bxBYwJSVMvJOZqrJnrUmLuXZsmUHNO6xHX_WdbphwIih_2wD0hlbGxvLCBXb3JsZCAh=='
    const keys = importKeys(secretKey)
    expect(keys.public).toEqual(publicKey)
    const expected = 'Hello, World !'
    const received = verifySignature(message, keys.raw.publicKey)
    expect(received).toEqual(expected)
  })

  test('Known test vector, no padding', () => {
    const secretKey =
      'ssk.IPwaySrr89g2ymWBrqC81qk7NCmenVN_gFmiz9gtAuTWGhwBv-mSUWbFeS9Zk00Iir8z2GM5Eue4v39FEpOiFw'
    const publicKey = 'spk.1hocAb_pklFmxXkvWZNNCIq_M9hjORLnuL9_RRKTohc'
    const message =
      'v1.naclsig.5InC2t-TYSFwIFOv-M2nY2zvPYD_ZVExkUqx3bxBYwJSVMvJOZqrJnrUmLuXZsmUHNO6xHX_WdbphwIih_2wD0hlbGxvLCBXb3JsZCAh'
    const keys = importKeys(secretKey)
    expect(keys.public).toEqual(publicKey)
    const expected = 'Hello, World !'
    const received = verifySignature(message, keys.raw.publicKey)
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

  test('Verify signature from wrong public key', () => {
    const publicKey = 'spk.thisisnotthecorrectpublickeyforthismessage_'
    const message =
      'v1.naclsig.5InC2t-TYSFwIFOv-M2nY2zvPYD_ZVExkUqx3bxBYwJSVMvJOZqrJnrUmLuXZsmUHNO6xHX_WdbphwIih_2wD0hlbGxvLCBXb3JsZCAh'
    const pk = parsePublicKey(publicKey)
    const run = () => verifySignature(message, pk)
    expect(run).toThrowError('Failed to verify signature')
  })

  test('Verify signature with invalid format', () => {
    const publicKey = 'spk.1hocAb_pklFmxXkvWZNNCIq_M9hjORLnuL9_RRKTohc'
    const message = 'not an actual message'
    const pk = parsePublicKey(publicKey)
    const run = () => verifySignature(message, pk)
    expect(run).toThrowError('Invalid secret key format')
  })
})
