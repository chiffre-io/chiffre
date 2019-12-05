import nanoid from 'nanoid'
import { createEvent } from './events'
import { EmitterConfig } from './config'
import { pushEvent } from './push'

export const sessionID = nanoid()

export interface SessionData {
  timestamp: number
  sessionID: string
}

export const sessionStart = () => {
  return createEvent<'session:start', SessionData>('session:start', {
    timestamp: Date.now(),
    sessionID
  })
}

export const sessionEnd = () => {
  return createEvent<'session:end', SessionData>('session:end', {
    timestamp: Date.now(),
    sessionID
  })
}

export const setupSessionListeners = (config: EmitterConfig) => {
  const sessionStartEvent = sessionStart()
  window.addEventListener('beforeunload', () => {
    pushEvent(sessionEnd(), config)
  })
  pushEvent(sessionStartEvent, config)
}
