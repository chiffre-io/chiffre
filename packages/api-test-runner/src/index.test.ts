import axios from 'axios'
import { SignupParameters } from '@chiffre/api'
import { createSignupEntities } from '@chiffre/crypto'

const api = axios.create({
  baseURL: `${process.env.API_URL}/v1/`,
  validateStatus: () => true
})

test('/_health', async () => {
  const res = await api.get('/_health')
  expect(res.status).toEqual(404)
})

describe('/auth/signup', () => {
  test('Signup a new user', async () => {
    const body: SignupParameters = await createSignupEntities(
      'test.user@example.com',
      'password'
    )
    const res = await api.post('/auth/signup', body)
    expect(res.status).toEqual(201) // Created
    expect(res.headers['set-cookie']).toHaveLength(2)
    expect(res.headers['set-cookie'][0]).toContain('chiffre:jwt-claims')
    expect(res.headers['set-cookie'][1]).toContain('chiffre:jwt-sig')
  })

  test('Username already in use', async () => {
    const body: SignupParameters = await createSignupEntities(
      'test.user@example.com',
      'password'
    )
    const res = await api.post('/auth/signup', body)
    expect(res.status).toEqual(409) // Conflict
    expect(res.data.error).toEqual('This username is not available')
    expect(res.headers['set-cookie']).toBeUndefined()
  })
})
