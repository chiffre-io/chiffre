import { App } from '../types'
import { AuthenticatedRequest } from '../plugins/auth'
import {
  findEventsForUser,
  Event,
  EventTypes
} from '../db/models/business/Events'
import { ActivityResponse, activityResponsesSchema } from './activity.schema'
import { TwoFactorStatus } from '../exports/defs'

function messageForEvent(event: Event): string {
  switch (event.type) {
    case EventTypes.signup:
      return `Account created`
    case EventTypes.login:
      return `Login`
    case EventTypes.twoFactorStatusChanged:
      const { from, to } = event.meta
      if (from === TwoFactorStatus.disabled && to === TwoFactorStatus.enabled) {
        return `Two factor authentication enabled`
      }
      if (from === TwoFactorStatus.enabled && to === TwoFactorStatus.verified) {
        return `Two factor authentication verified`
      }
      if (
        from === TwoFactorStatus.verified &&
        to === TwoFactorStatus.disabled
      ) {
        return `Two factor authentication disabled`
      }
      return `Two factor authentication status changed from ${from} to ${to}`
    case EventTypes.projectCreated:
      return `Project created`
    default:
      return event.type
  }
}

export default async (app: App) => {
  app.get(
    '/activity',
    {
      preValidation: [app.authenticate()],
      schema: {
        summary: 'List account activity',
        response: {
          200: activityResponsesSchema
        }
      }
    },
    async (req: AuthenticatedRequest, res) => {
      const events = await findEventsForUser(app.db, req.auth.userID)
      const activity: ActivityResponse[] = events.map(event => ({
        eventID: event.id,
        type: event.type,
        ip: event.ip,
        message: messageForEvent(event),
        date: event.created_at,
        meta: event.meta
      }))
      return res.send(activity)
    }
  )
}
