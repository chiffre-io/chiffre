import Knex from 'knex'
import { createUser } from '../models/auth/UsersAuthSRP'
import { createUserAuthSettings } from '../models/auth/UsersAuthSettings'
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
    const userID = await createUser(knex, username, salt, verifier)
    await createUserAuthSettings(knex, userID)
  } catch (error) {
    // Maybe it already exists
  }
}
