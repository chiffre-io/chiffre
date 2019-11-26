import Knex from 'knex'
import { createUser } from '../models/auth/UsersAuthSRP'
import { clientSignup } from '../../../client/engine/crypto/srp'

export const seed = async (knex: Knex) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  const { username, salt, verifier } = await clientSignup(
    'admin@example.com',
    'password'
  )
  try {
    await createUser(knex, username, salt, verifier)
  } catch (error) {
    // Maybe it already exists
  }
}
