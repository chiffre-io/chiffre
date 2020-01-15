import Knex from 'knex'
import { Plans, allPlans } from '../../../exports/defs'
import { AuthenticatedRequest } from '../../../plugins/auth'
import { USERS_TABLE } from '../auth/Users'

export const EVENTS_TABLE = 'events'

export enum EventTypes {
  // Auth
  signup = 'auth/signup',
  login = 'auth/login',
  twoFactorStatusChanged = 'auth/2fa/changed',
  twoFactorVerified = 'auth/2fa/verified',

  // Business
  changePlan = 'plan/changed'
}

export interface Event<T = any> {
  type: EventTypes
  meta?: T
  userID: string
  plan: Plans
  ip: string
  requestID: string
  tokenID: string
}

export async function logEvent<T>(
  db: Knex,
  type: EventTypes,
  req: AuthenticatedRequest,
  meta?: T
) {
  const event: Event<T> = {
    type,
    userID: req.auth.userID,
    plan: req.auth.plan,
    tokenID: req.auth.tokenID,
    requestID: req.raw.id as string,
    ip: req.ip,
    meta
  }
  req.log.info({ event, msg: 'Event' })
  await db.insert(event).into(EVENTS_TABLE)
}

// --

export async function createInitialEventsTable(db: Knex) {
  await db.schema.createTable(EVENTS_TABLE, table => {
    table.timestamp('created_at').defaultTo(db.fn.now())
    table
      .string('id')
      .notNullable()
      .defaultTo(db.raw('generate_b64id()'))
      .primary()

    // To add more types later (in a migration):
    // https://stackoverflow.com/questions/1771543/adding-a-new-value-to-an-existing-enum-type/7834949#7834949
    table
      .enum('type', [
        EventTypes.signup,
        EventTypes.login,
        EventTypes.twoFactorStatusChanged,
        EventTypes.twoFactorVerified,
        EventTypes.changePlan
      ])
      .notNullable()
    table.json('meta').nullable()

    table
      .string('userID')
      .notNullable()
      .index()
    table.foreign('userID').references(`${USERS_TABLE}.id`)
    table.enum('plan', allPlans)
    table.text('ip').notNullable()
    table.string('requestID').notNullable()
    table.string('tokenID')
  })
}
