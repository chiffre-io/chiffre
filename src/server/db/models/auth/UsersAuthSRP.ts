import Knex from 'knex'

export const USERS_AUTH_SRP_TABLE = 'users_auth_srp'

interface UserAuthSrpInput {
  username: string
  salt: string
  verifier: string
}

export interface UserAuthSrp extends UserAuthSrpInput {
  id: string
}

// --

export const createUser = async (
  db: Knex,
  username: string,
  salt: string,
  verifier: string
): Promise<string> => {
  const user: UserAuthSrpInput = {
    username,
    salt,
    verifier
  }
  const result = await db
    .insert(user)
    .into(USERS_AUTH_SRP_TABLE)
    .returning<string[]>('id')
  return result[0]
}

export const findUserByUsername = async (db: Knex, username: string) => {
  const result = await db
    .select<UserAuthSrp[]>('*')
    .from(USERS_AUTH_SRP_TABLE)
    .where({ username })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return result[0]
}

export const findUser = async (db: Knex, userID: string) => {
  const result = await db
    .select<UserAuthSrp[]>('*')
    .from(USERS_AUTH_SRP_TABLE)
    .where({ id: userID })
    .limit(1)
  if (result.length === 0) {
    return null
  }
  return result[0]
}

// --

export const createInitialUsersAuthSrpTable = async (db: Knex) => {
  await db.schema.createTable(USERS_AUTH_SRP_TABLE, table => {
    table.timestamp('created_at').defaultTo(db.fn.now())
    table
      .uuid('id')
      .unique()
      .notNullable()
      .defaultTo(db.raw('uuid_generate_v4()'))
      .primary()
    table
      .string('username')
      .unique()
      .notNullable()
      .index()
    table
      .string('salt')
      .unique()
      .notNullable()
    table
      .string('verifier', 512) // 512 would be hex, but we store as b64. Keep some padding anyway
      .unique()
      .notNullable()
  })
}
