import { Keychain } from '@chiffre/crypto-client'

export interface KeychainResponse extends Keychain {
  key: string
}
