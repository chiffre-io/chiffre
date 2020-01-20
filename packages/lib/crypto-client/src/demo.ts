import { generateKey } from '@47ng/cloak'
import { createKeychain, lockKeychain } from './keychain'
import { packMessage, unpackMessage, Peer } from './peers'
import faker from 'faker'
import { performance } from 'perf_hooks'

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

async function main() {
  const { keychain: keychainA, peer: peerA } = await createPeerData()
  const { keychain: keychainB, peer: peerB } = await createPeerData()

  let msg = ''

  let tick = performance.now()
  for (let i = 0; i < 100; ++i) {
    msg = packMessage(faker.random.words(4), peerB, keychainA)
    // // const bToA = packMessage(faker.random.words(4), peerA, keychainB)
    // const foo = unpackMessage(aToB, peerA, keychainB)
    // // const bar = unpackMessage(bToA, peerB, keychainA)
    // //console.dir({ foo, bar, aToB, bToA })
  }
  let tock = performance.now()
  console.log('Send', (100 * 1000) / (tock - tick))

  tick = performance.now()
  for (let i = 0; i < 100; ++i) {
    const foo = unpackMessage(msg, peerA, keychainB)
  }
  tock = performance.now()
  console.log('Receive', (100 * 1000) / (tock - tick))
}

main()
