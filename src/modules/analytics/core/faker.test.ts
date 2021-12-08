import { isBrowserEvent } from 'modules/analytics/core'
import { sealedBoxRegex } from 'modules/crypto/box'
import generateFakePayloadStream, { generateFakeSession } from './faker'

describe('analytics/core/faker', () => {
  test('Only push browser events', () => {
    const session = generateFakeSession()
    expect(session.every(event => isBrowserEvent(event)))
  })

  test('Payload stream', () => {
    const publicKey = 'pk.NUIPDTJHmN2HR7NeAtNANmHmjCJASGwxb_Rva9S6rUU'
    // const secretKey = 'sk.J9irbvZWxkTyYd0f4JLKYe5r8QmRK6s0ZcaeyFR_JV8'
    const payloads = generateFakePayloadStream(4, publicKey)

    expect(payloads.every(p => p.match(sealedBoxRegex)))
    const parts = payloads.map(p => p.match(sealedBoxRegex)!.slice(1))
    // Test that all parts are unique
    expect(new Set(parts.map(p => p[0])).size).toEqual(payloads.length)
    expect(new Set(parts.map(p => p[1])).size).toEqual(payloads.length)
    expect(new Set(parts.map(p => p[2])).size).toEqual(payloads.length)
  })
})
