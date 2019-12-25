import Knex from 'knex'
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
  const key = findKeyForMessage(encrypted, keychain)
  return await decryptString(encrypted, key)
}

export interface RotateTableArgs<T> {
  tableName: string
  fields: (keyof T)[]
  cloak: (entity: T) => Promise<T>
  decloak: (entity: T) => Promise<T>
  idFieldName?: keyof T
}

export type RotationErrorReport = {
  id: string
  error: string
}

export interface RotationResults {
  processed: string[] // record IDs
  errors: RotationErrorReport[]
}

export const rotateTableCloak = async <T>(
  db: Knex,
  args: RotateTableArgs<T>
): Promise<RotationResults> => {
  const id = args.idFieldName || ('id' as keyof T)
  const prefix = getCurrentCloakPrefix()
  const whereClause = args.fields
    .map(field => `not "${field}" like '${prefix}%'`)
    .join(' or ')

  const oldRecords = await db
    .select<T[]>('*')
    .from(args.tableName)
    .whereRaw(whereClause)

  let processed = []
  let errors = []
  for (const record of oldRecords as T[]) {
    try {
      const oldRecord = { ...record }
      const newRecord = await args.cloak(await args.decloak(record))
      // Match ID and old fields to avoid race conditions
      await db(args.tableName)
        .update(newRecord)
        .where(oldRecord)
      processed.push(record[id])
    } catch (error) {
      errors.push({ [id]: record[id], error: error.message })
    }
  }
  return { processed, errors }
}
