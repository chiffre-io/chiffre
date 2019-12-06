import { CloakKey } from './crypto/cloak'

interface KeyStorage {
  keychainKey: CloakKey
}

const proxy = new Proxy<KeyStorage>(
  Object.seal({
    keychainKey: null
  }),
  {
    set: (target, property, value) => {
      if (property === 'keychainKey') {
        console.warn('Mutating keychain key')
      }
      target[property] = value
      return true
    },
    get: (target, property) => {
      if (property === 'keychainKey') {
        console.warn('Accessing keychain key')
      }
      return target[property]
    }
  }
)

export default proxy
