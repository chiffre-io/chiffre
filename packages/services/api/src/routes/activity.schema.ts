import S from 'fluent-schema'

export interface ActivityResponse {
  eventID: string
  type: string
  message: string
  date: Date
  ip: string
  meta?: any
}

export const activityResponseSchema = S.object()
  .prop('eventID', S.string())
  .prop('type', S.string())
  .prop('message', S.string())
  .prop('date', S.string()) // ISO-8601 UTC
  .prop('ip', S.string())

export const activityResponsesSchema = S.array().items(activityResponseSchema)
