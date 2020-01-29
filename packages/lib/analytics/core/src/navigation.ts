import { createEvent, EventSender } from './events'

export interface PageVisitData {
  from: string
}

export const setupPageVisitListeners = (send: EventSender) => {
  let oldPath = window.location.pathname

  setInterval(() => {
    const newPath = window.location.pathname
    if (oldPath === newPath) {
      return
    }
    // the `to` part is sent in the event body as `path`
    const event = createEvent(`page:visit`, {
      from: oldPath
    })
    oldPath = newPath
    send(event)
  }, 500)
}
