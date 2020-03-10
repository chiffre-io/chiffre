import 'jest-extended'
import { setup, TestContext } from './utility'
import { TwoFactorStatus, CookieNames, Plans } from '@chiffre/api-types'
import { generateTwoFactorToken } from '@chiffre/api/src/auth/2fa'
import { EventTypes } from '@chiffre/api/src/db/models/business/Events'

let ctx: TestContext = undefined

jest.useFakeTimers()

beforeAll(async () => {
  ctx = await setup()
}, 10000)

afterAll(async () => {
  ctx.client.lock()
  await ctx.server.close()
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
  const p = ctx.client.signup('test.user@example.com', 'password', 'Test User')
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
  const project1 = await ctx.client.createProject({
    name: 'foo',
    url: 'https://example.com'
  })
  const project2 = await ctx.client.createProject({
    name: 'bar',
    url: 'https://example.com',
    vaultID: project1.vaultID
  })
  expect(project2.vaultID).toEqual(project1.vaultID)
  expect(project1.id).not.toEqual(project2.id)
  expect(project1.name).toEqual('foo')
  expect(project2.name).toEqual('bar')
  expect(project1.publicKey).not.toEqual(project2.publicKey)
  // Access projects by ID
  expect(ctx.client.getProject(project1.id)).toEqual(project1)
  expect(ctx.client.getProject(project2.id)).toEqual(project2)
})

test('Account activity', async () => {
  const activity = await ctx.client.getAccountActivity()
  expect(activity.length).toBe(4)
  // Events are sorted most recent first
  expect(activity[0].type).toEqual(EventTypes.projectCreated)
  expect(activity[1].type).toEqual(EventTypes.projectCreated)
  expect(activity[2].type).toEqual(EventTypes.login)
  expect(activity[3].type).toEqual(EventTypes.signup)
})

test('Lock', async () => {
  expect(ctx.client.lock())
  expect(ctx.client.isLocked).toBeTrue()
  expect(ctx.client.identity).toBeNil()
  expect(ctx.client.projects).toBeEmpty()
  expect(ctx.client.settings.twoFactor.status).toBeNil()

  // Restore state
  await ctx.client.login('test.user@example.com', 'password')
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

test('2FA - Login with valid 2FA token', async () => {
  ctx.client.lock()
  const { requireTwoFactorAuthentication } = await ctx.client.login(
    'test.user@example.com',
    'password'
  )
  expect(requireTwoFactorAuthentication).toBeTrue()
  expect(ctx.client.settings.twoFactor.status).toEqual(TwoFactorStatus.enabled)
  const token = generateTwoFactorToken(totpSecret)
  const p = ctx.client.verifyTwoFactorToken(token)
  await expect(p).resolves.toBeNil()
})

test('2FA - Login with invalid 2FA token', async () => {
  ctx.client.lock()
  await ctx.client.login('test.user@example.com', 'password')
  const token = generateTwoFactorToken(totpSecret)
  const wrongToken = ((parseInt(token) + 1) % 999999).toString()
  const p = ctx.client.verifyTwoFactorToken(wrongToken)
  await expect(p).rejects.toContain('Invalid')
})

test('2FA - Login with valid 2FA token supplied after grace period', async () => {
  ctx.client.lock()
  await ctx.client.login('test.user@example.com', 'password')
  jest.advanceTimersByTime(60 * 1000) // Wait for 1 minute
  const token = generateTwoFactorToken(totpSecret)
  const p = ctx.client.verifyTwoFactorToken(token)
  await expect(p).rejects.toThrowError('Session expired, please log in again')
})

test('2FA - Disable', async () => {
  // Reset login state
  {
    ctx.client.lock()
    await ctx.client.login('test.user@example.com', 'password')
    const token = generateTwoFactorToken(totpSecret)
    await ctx.client.verifyTwoFactorToken(token)
  }
  expect(ctx.client.settings.twoFactor.status).toEqual(TwoFactorStatus.verified)
  const token = generateTwoFactorToken(totpSecret)
  await ctx.client.settings.twoFactor.disable(token)
  expect(ctx.client.settings.twoFactor.status).toEqual(TwoFactorStatus.disabled)
  totpSecret = undefined
})
