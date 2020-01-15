import nanoid from 'nanoid'
import { createEvent } from './events'
import { EmitterConfig } from './config'
import { pushEvent } from './push'

export const sessionID = nanoid()

export interface SessionData {
  ua: string // user-agent
  lang: string // language
  ref: string // referer
  vp: {
    // viewport dimensions
    w: number
    h: number
  }
}

export const sessionStart = () => {
  return createEvent<SessionData>('session:start', {
    ua: navigator.userAgent,
    lang: navigator.language,
    ref: document.referrer,
    vp: {
      w: window.innerWidth,
      h: window.innerHeight
    }
  })
}

export const sessionEnd = () => {
  return createEvent('session:end')
}

export const setupSessionListeners = (config: EmitterConfig) => {
  const startEvent = sessionStart()
  window.addEventListener('beforeunload', () => {
    const endEvent = sessionEnd()
    pushEvent(endEvent, config)
  })
  pushEvent(startEvent, config)
}
