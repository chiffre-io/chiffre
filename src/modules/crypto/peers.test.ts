import { generateKey } from '@47ng/cloak'
import { createKeychain, lockKeychain } from './keychain'
import { keychainToPeer, packMessage, Peer, unpackMessage } from './peers'

const createPeerData = async () => {
  const key = generateKey()
  const keychain = createKeychain()
  const locked = await lockKeychain(keychain, key)
  const peer: Peer = {
    signature: locked.signature.public,
    sharing: locked.sharing.public
  }
  return { keychain, peer }
}

describe('crypto/peers', () => {
  test('exchange', async () => {
    const { keychain: keychainA, peer: peerA } = await createPeerData()
    const { keychain: keychainB, peer: peerB } = await createPeerData()

    const aToB = packMessage('Hello', peerB, keychainA)
    const bToA = packMessage('Holla', peerA, keychainB)
    const foo = unpackMessage(aToB, peerA, keychainB)
    const bar = unpackMessage(bToA, peerB, keychainA)
    expect(foo).toEqual('Hello')
    expect(bar).toEqual('Holla')
  })

  test('Locked and peer should have identical fields', async () => {
    const keychain = createKeychain()
    const key = generateKey()
    const locked = await lockKeychain(keychain, key)
    const peer = keychainToPeer(keychain)
    expect(peer.sharing).toEqual(locked.sharing.public)
    expect(peer.signature).toEqual(locked.signature.public)
  })
})
