import {
  importKeychain,
  CloakedString,
  encryptString,
  decryptString,
  findKeyForMessage
} from '@47ng/cloak'
import serverRuntimeConfig from '~/src/server/env'

const getKeychain = async () => {
  return await importKeychain(
    serverRuntimeConfig.CLOAK_KEYCHAIN,
    serverRuntimeConfig.CLOAK_MASTER_KEY
  )
}

export const getCurrentCloakPrefix = () => {
  return `v1.aesgcm256.${serverRuntimeConfig.CLOAK_CURRENT_KEY}.`
}

export const cloakValue = async (clearText: string): Promise<CloakedString> => {
  const keychain = await getKeychain()
  const newKey = keychain[serverRuntimeConfig.CLOAK_CURRENT_KEY]
  return await encryptString(clearText, newKey.key)
}

export const decloakValue = async (encrypted: CloakedString) => {
  const keychain = await getKeychain()
  const key = await findKeyForMessage(encrypted, keychain)
  return await decryptString(encrypted, key)
}
