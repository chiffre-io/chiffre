import { Keychain } from '@chiffre/crypto'

export interface KeychainResponse extends Keychain {
  key: string
}
