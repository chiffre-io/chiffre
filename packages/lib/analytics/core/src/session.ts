import nanoid from 'nanoid'
import { createEvent, EventSender } from './events'

export const sessionID = nanoid()

export interface SessionData {
  ua: string // user-agent
  os: string // operating system
  ref: string // referer
  lang: string // language
  tzo: number // timezone offset from UTC in minutes
  vp: {
    // viewport dimensions
    w: number
    h: number
  }
  lvd?: string // last visit date, ISO-8601
}

export const sessionStart = () => {
  const event = createEvent('session:start', {
    ua: navigator.userAgent,
    os: navigator.platform,
    ref: document.referrer,
    lang: navigator.language,
    tzo: new Date().getTimezoneOffset(),
    vp: {
      w: window.innerWidth,
      h: window.innerHeight
    },
    lvd: window.localStorage.getItem('chiffre:last-visit-date') || undefined
  })
  window.localStorage.setItem(
    'chiffre:last-visit-date',
    new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  )
  return event
}

export const sessionEnd = () => {
  return createEvent('session:end')
}

export const setupSessionListeners = (send: EventSender) => {
  const startEvent = sessionStart()
  window.addEventListener('beforeunload', () => {
    send(sessionEnd())
  })
  send(startEvent)
}
