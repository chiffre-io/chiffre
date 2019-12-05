import fs from 'fs'
import dotenv from 'dotenv'
import program from 'commander'
import {
  importKeychain,
  generateKey,
  encryptString,
  decryptString,
  getKeyFingerprint,
  findKeyForMessage,
  exportKeychain
} from '~/src/client/engine/crypto/cloak'

dotenv.config()

program.command('revoke <keyFingerprint>').action(async keyFingerprint => {
  const keychain = await importKeychain(
    process.env.CLOAKING_KEYCHAIN,
    process.env.CLOAKING_MASTER_KEY
  )
  // todo: Support revoking by key itself
  const { [keyFingerprint]: _, ...newKeychain } = keychain
  console.log(
    await exportKeychain(newKeychain, process.env.CLOAKING_MASTER_KEY)
  )
})

program
  .command('generate')
  .description('Generate an AES-GCM key')
  .action(async () => {
    const keychain = await importKeychain(
      process.env.CLOAKING_KEYCHAIN,
      process.env.CLOAKING_MASTER_KEY
    )
    const key = await generateKey()
    console.log(key)

    keychain[await getKeyFingerprint(key)] = key
    console.log(
      'New keychain:',
      await exportKeychain(keychain, process.env.CLOAKING_MASTER_KEY)
    )
  })

program
  .command('keychain [secure]')
  .option('-s, --secure', 'Only list the key fingerprints')
  .action(async (_, { secure }) => {
    const keychain = await importKeychain(
      process.env.CLOAKING_KEYCHAIN,
      process.env.CLOAKING_MASTER_KEY
    )
    console.log(
      JSON.stringify(secure ? Object.keys(keychain) : keychain, null, 2)
    )
  })

program.command('encrypt <key>').action(async key => {
  const stdin = fs.readFileSync(0, 'utf-8')
  const ciphertext = await encryptString(stdin, key)
  console.log(ciphertext)
})

program.command('decrypt [key]').action(async key => {
  const stdin = fs.readFileSync(0, 'utf-8')
  const keychain = await importKeychain(
    process.env.CLOAKING_KEYCHAIN,
    process.env.CLOAKING_MASTER_KEY
  )
  if (key) {
    keychain[await getKeyFingerprint(key)] = key
  }
  const keyFoo = await findKeyForMessage(stdin, keychain)
  const cleartext = await decryptString(stdin, keyFoo)
  console.log(cleartext)
})

program.parse(process.argv)
