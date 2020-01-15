import { setup, TestContext } from './utility'
import { TwoFactorStatus } from '@chiffre/api/src/auth/types'
import { generateTwoFactorToken } from '@chiffre/api/src/auth/2fa'

let ctx: TestContext = undefined

beforeAll(async () => {
  ctx = await setup()
})

afterAll(async () => {
  for (const cron of ctx.crons) {
    cron.stop()
  }
  ctx.client.lock()
  await ctx.server.close()
  await ctx.server.db.destroy()
})

// -----------------------------------------------------------------------------

test('Signup', async () => {
  const p = ctx.client.signup('test.user@example.com', 'password')
  await expect(p).resolves.toBeUndefined()
})

test('Login', async () => {
  const p = ctx.client.login('test.user@example.com', 'password')
  await expect(p).resolves.toMatchObject({
    requireTwoFactorAuthentication: false
  })
})

test('Create projects', async () => {
  const project1 = await ctx.client.createProject()
  const project2 = await ctx.client.createProject(project1.vaultID)
  expect(project2.vaultID).toEqual(project1.vaultID)
  expect(project1.id).not.toEqual(project2.id)
  expect(project1.embedScript).not.toEqual(project2.embedScript)
  expect(project1.keyPair).not.toEqual(project2.keyPair)
  // Access projects by ID
  expect(ctx.client.getProject(project1.id)).toEqual(project1)
  expect(ctx.client.getProject(project2.id)).toEqual(project2)
})

// --

let totpSecret: string | undefined = undefined

test('2FA - Start enabling, but cancel', async () => {
  expect(ctx.client.settings.twoFactor.status).toEqual(TwoFactorStatus.disabled)
  await ctx.client.settings.twoFactor.enable()
  expect(ctx.client.settings.twoFactor.status).toEqual(TwoFactorStatus.enabled)
  await ctx.client.settings.twoFactor.cancel()
  expect(ctx.client.settings.twoFactor.status).toEqual(TwoFactorStatus.disabled)
})

test('2FA - Enable', async () => {
  expect(ctx.client.settings.twoFactor.status).toEqual(TwoFactorStatus.disabled)
  const { text } = await ctx.client.settings.twoFactor.enable()
  totpSecret = text
  expect(ctx.client.settings.twoFactor.status).toEqual(TwoFactorStatus.enabled)
  const token = generateTwoFactorToken(totpSecret)
  await ctx.client.settings.twoFactor.verify(token)
  expect(ctx.client.settings.twoFactor.status).toEqual(TwoFactorStatus.verified)
})

test('2FA - Disable', async () => {
  expect(ctx.client.settings.twoFactor.status).toEqual(TwoFactorStatus.verified)
  const token = generateTwoFactorToken(totpSecret)
  await ctx.client.settings.twoFactor.disable(token)
  expect(ctx.client.settings.twoFactor.status).toEqual(TwoFactorStatus.disabled)
  totpSecret = undefined
})
