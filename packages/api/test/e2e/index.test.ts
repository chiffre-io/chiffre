import { setup, TestContext } from './utility'
import {
  createSignupEntities,
  clientAssembleLoginResponse
} from '@chiffre/crypto'
import { SignupParameters } from '../../src/routes/auth/signup.schema'
import { LoginResponseParameters } from '../../src/routes/auth/login/response.schema'
import { LoginChallengeResponseBody } from '../../src/routes/auth/login/challenge.schema'
import { CookieNames } from '../../src/exports/defs'

let ctx: TestContext = null

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

test('/_health', async () => {
  const res = await ctx.api.get('/_health')
  expect(res.status).toEqual(200)
})

// -----------------------------------------------------------------------------

describe('Signup flow', () => {
  test('Signup a new user', async () => {
    const body: SignupParameters = await createSignupEntities(
      'test.user@example.com',
      'password'
    )
    const res = await ctx.api.post('/v1/auth/signup', body)
    expect(res.status).toEqual(201) // Created
    expect(res.headers['set-cookie']).toHaveLength(2)
    expect(res.headers['set-cookie'][0]).toContain(CookieNames.jwt)
    expect(res.headers['set-cookie'][1]).toContain(CookieNames.sig)
  })

  test('Username already in use', async () => {
    const body: SignupParameters = await createSignupEntities(
      'test.user@example.com',
      'password'
    )
    const res = await ctx.api.post('/v1/auth/signup', body)
    expect(res.status).toEqual(409) // Conflict
    expect(res.data.message).toEqual('This username is not available')
    expect(res.headers['set-cookie']).toBeUndefined()
  })
})

// -----------------------------------------------------------------------------

describe('Login flow', () => {
  test('with unknown user', async () => {
    const res = await ctx.api.post('/v1/auth/login/challenge', {
      username: 'unknown user'
    })
    expect(res.status).toEqual(404)
    expect(res.headers['set-cookie']).toBeUndefined()
  })
  test('with correct credentials', async () => {
    const username = 'test.user@example.com'

    const res1 = await ctx.api.post('/v1/auth/login/challenge', { username })
    expect(res1.status).toEqual(200)
    expect(res1.headers['set-cookie']).toBeUndefined()
    const challengeResponse: LoginChallengeResponseBody = res1.data

    const response = await clientAssembleLoginResponse(
      username,
      'password',
      challengeResponse.srpSalt,
      challengeResponse.ephemeral
    )
    const responseBody: LoginResponseParameters = {
      userID: challengeResponse.userID,
      challengeID: challengeResponse.challengeID,
      ephemeral: response.ephemeral.public,
      proof: response.session.proof
    }
    const res2 = await ctx.api.post('/v1/auth/login/response', responseBody)
    expect(res2.status).toEqual(200)
    expect(res2.headers['set-cookie']).toHaveLength(2)
    expect(res2.headers['set-cookie'][0]).toContain(CookieNames.jwt)
    expect(res2.headers['set-cookie'][1]).toContain(CookieNames.sig)
  })
})
