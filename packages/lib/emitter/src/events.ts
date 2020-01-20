import { sessionID } from './session'

export interface Event<D = any> {
  v: number
  type: string
  time: number
  sid: string
  path: string
  data?: D
}

export function createEvent<D = never>(type: string, data?: D): Event<D> {
  return {
    v: 1,
    type,
    sid: sessionID,
    time: Date.now(),
    path: window.location.pathname,
    data
  }
}
