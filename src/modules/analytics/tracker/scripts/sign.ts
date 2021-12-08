import { b64, utf8 } from '@47ng/codec'
import { importKeys, signUtf8String } from 'modules/crypto/signature'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { outputBundlePath } from './paths'

export function sha256(text: string | Buffer) {
  const hash = crypto.createHash('sha256')
  hash.update(text)
  return `sha256:${b64.encode(hash.digest())}`
}

export async function hashFile(filePath: string) {
  const contents = await fs.readFile(filePath)
  return sha256(contents)
}

export interface Metadata {
  version: string
  gitSha1: string
  buildUrl: string
}

export interface Header extends Metadata {
  fileHash: string
  spk: string
}

export async function generateHeader(
  meta: Metadata,
  secretKey: string,
  filePath: string
) {
  const keys = importKeys(secretKey)
  const hash = await hashFile(filePath)
  const header: Header = {
    ...meta,
    fileHash: hash,
    spk: keys.public.slice(4, 12)
  }
  const json = JSON.stringify(header)
  const jsonHash = sha256(json)
  const signature = signUtf8String(jsonHash, keys.raw.secretKey)
  console.log('Header contents:')
  console.dir(header)
  console.log(`Header JSON: ${json}`)
  console.log(`Header hash: ${jsonHash}`)
  console.log(`Signature:   ${signature}`)
  console.log(`Public key:  ${keys.public}`)
  return `/*chiffre:sig ${signature}*/\n/*chiffre:header ${json}*/\n`
}

export async function run() {
  const contents = utf8.decode(await fs.readFile(outputBundlePath))
  if (contents.startsWith('/*chiffre:sig ')) {
    return // Already signed
  }
  const meta: Metadata = {
    version: 'foo', // await getLatestTag(),
    gitSha1: process.env.GITHUB_SHA || 'local',
    buildUrl: process.env.GITHUB_RUN_ID
      ? `https://github.com/chiffre-io/analytics-tracker/actions/runs/${process.env.GITHUB_RUN_ID}`
      : 'local'
  }
  const secretKey = process.env.SIGNATURE_SECRET_KEY
  if (!secretKey) {
    console.error('Missing signature secret key (env: SIGNATURE_SECRET_KEY)')
  }
  const header = await generateHeader(meta, secretKey!, outputBundlePath)
  await fs.writeFile(outputBundlePath, header + contents)
}

if (require.main === module) {
  run()
}
