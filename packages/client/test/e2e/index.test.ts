import { setup, TestContext } from './utility'

let ctx: TestContext = undefined

beforeAll(async () => {
  ctx = await setup()
})

afterAll(async () => {
  for (const cron of ctx.crons) {
    cron.stop()
  }
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
