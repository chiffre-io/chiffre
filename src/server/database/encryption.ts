import {
  CloakedString,
  CloakKeychain,
  decryptString,
  encryptString,
  findKeyForMessage,
  importKeychain
} from '@47ng/cloak'
import type { Knex } from 'knex'

let cloakKeychain: CloakKeychain | null = null

const getCloakKeychain = async () => {
  if (cloakKeychain) {
    return cloakKeychain
  }
  cloakKeychain = await importKeychain(
    process.env.CLOAK_KEYCHAIN!,
    process.env.CLOAK_MASTER_KEY!
  )
  return cloakKeychain
}

export function getCurrentCloakPrefix() {
  return `v1.aesgcm256.${process.env.CLOAK_CURRENT_KEY}.`
}

export async function cloakValue(clearText: string): Promise<CloakedString> {
  if (process.env.CHIFFRE_API_DISABLE_CLOAK === 'true') {
    return clearText
  }
  const keychain = await getCloakKeychain()
  const newKey = keychain[process.env.CLOAK_CURRENT_KEY!]
  return await encryptString(clearText, newKey.key)
}

export async function decloakValue(encrypted: CloakedString) {
  if (process.env.CHIFFRE_API_DISABLE_CLOAK === 'true') {
    return encrypted
  }
  const keychain = await getCloakKeychain()
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

export async function rotateTableCloak<T>(
  db: Knex,
  args: RotateTableArgs<T>
): Promise<RotationResults> {
  const id = args.idFieldName || ('id' as keyof T)
  const prefix = getCurrentCloakPrefix()
  const whereClause = args.fields
    .map(field => `not "${field}" like '${prefix}%'`)
    .join(' or ')

  const oldRecords = await db
    .select<T[]>(...(args.fields as any))
    .from(args.tableName)
    .whereRaw(whereClause)

  let processed: string[] = []
  let errors: RotationErrorReport[] = []
  for (const record of oldRecords as T[]) {
    try {
      const oldRecord = { ...record }
      const newRecord = await args.cloak(await args.decloak(record))
      // Match ID and old fields to avoid race conditions
      await db(args.tableName).update(newRecord).where(oldRecord)
      processed.push(String(record[id]))
    } catch (error) {
      // @ts-ignore
      errors.push({ [id]: record[id], error: (error as Error).message })
    }
  }
  return { processed, errors }
}
