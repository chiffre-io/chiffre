import { sessionID, SessionData } from './session'
import { PageVisitData } from './navigation'

export interface EventPayloadTypes {
  'session:start': SessionData
  'session:end': never
  'page:visit': PageVisitData
}

export type EventTypes = keyof EventPayloadTypes
export type EventDataType<T extends EventTypes> = EventPayloadTypes[T]

export interface Event<T extends EventTypes> {
  v: number
  type: T
  time: number
  sid: string
  path: string
  data?: EventDataType<T>
}

export function createEvent<T extends EventTypes>(
  type: T,
  data?: EventDataType<T>
): Event<T> {
  return {
    v: 1,
    type,
    sid: sessionID,
    time: Date.now(),
    path: window.location.pathname,
    data
  }
}

export type EventSender = <T extends EventTypes>(event: Event<T>) => void
