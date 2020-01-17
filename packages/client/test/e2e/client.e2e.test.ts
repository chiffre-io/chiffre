import 'jest-extended'
import { setup, TestContext } from './utility'
import { TwoFactorStatus, CookieNames, Plans } from '@chiffre/api-types'
import { generateTwoFactorToken } from '@chiffre/api/src/auth/2fa'
import { EventTypes } from '@chiffre/api/src/db/models/business/Events'

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

test('Cookie names should not contain RegExp special characters', () => {
  expect(CookieNames.jwt).toMatch(/[\w:-]+/)
})

test('Identity should be null before logging in', () => {
  expect(ctx.client.isLocked).toBeTrue()
  expect(ctx.client.identity).toBeNull()
})

test('Signup', async () => {
  const p = ctx.client.signup('test.user@example.com', 'password')
  await expect(p).resolves.toBeUndefined()
  expect(ctx.client.isLocked).toBeFalse()
})

test('Login', async () => {
  const p = ctx.client.login('test.user@example.com', 'password')
  await expect(p).resolves.toMatchObject({
    requireTwoFactorAuthentication: false
  })
  expect(ctx.client.isLocked).toBeFalse()
})

test('Identity', () => {
  expect(ctx.client.identity).not.toBeNull()
  expect(ctx.client.identity.username).toEqual('test.user@example.com')
  expect(ctx.client.identity.plan).toEqual(Plans.free)
})

test('Create projects', async () => {
  const project1 = await ctx.client.createProject()
  const project2 = await ctx.client.createProject(project1.vaultID)
  expect(project2.vaultID).toEqual(project1.vaultID)
  expect(project1.id).not.toEqual(project2.id)
  expect(project1.embedScript).not.toEqual(project2.embedScript)
  expect(project1.publicKey).not.toEqual(project2.publicKey)
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

test('Account activity', async () => {
  const activity = await ctx.client.getAccountActivity()
  expect(activity.length).toBe(9)
  // Events are sorted most recent first
  expect(activity[1].type).toEqual(EventTypes.twoFactorStatusChanged)
  expect(activity[1].type).toEqual(EventTypes.twoFactorStatusChanged)
  expect(activity[2].type).toEqual(EventTypes.twoFactorStatusChanged)
  expect(activity[3].type).toEqual(EventTypes.twoFactorStatusChanged)
  expect(activity[4].type).toEqual(EventTypes.twoFactorStatusChanged)
  expect(activity[5].type).toEqual(EventTypes.projectCreated)
  expect(activity[6].type).toEqual(EventTypes.projectCreated)
  expect(activity[7].type).toEqual(EventTypes.login)
  expect(activity[8].type).toEqual(EventTypes.signup)
})

test('Lock', () => {
  expect(ctx.client.lock())
  expect(ctx.client.isLocked).toBeTrue()
  expect(ctx.client.identity).toBeNil()
  expect(ctx.client.projects).toBeEmpty()
  expect(ctx.client.settings.twoFactor.status).toBeNil()
})
