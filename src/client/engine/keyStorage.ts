import { CloakKey } from './crypto/cloak'
import { Keychain } from './keychain'

interface KeyStorage {
  keychainKey: CloakKey
  keychain: Keychain
}

const proxy = new Proxy<KeyStorage>(
  Object.seal({
    keychainKey: null,
    keychain: null
  }),
  {
    set: (target, property, value) => {
      if (property === 'keychainKey') {
        console.warn('Mutating keychain key')
      } else if (property === 'keychain') {
        console.warn('Mutating keychain')
      }
      target[property] = value
      return true
    },
    get: (target, property) => {
      if (property === 'keychainKey') {
        console.warn('Accessing keychain key')
      } else if (property === 'keychain') {
        console.warn('Accessing keychain')
      }
      return target[property]
    }
  }
)

export default proxy
