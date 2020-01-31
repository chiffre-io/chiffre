import { createBrowserEvent, EventSender } from './events'
import { sessionID } from './session'

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
    const event = createBrowserEvent(`page:visit`, {
      sid: sessionID,
      from: oldPath,
      path: newPath
    })
    oldPath = newPath
    send(event)
  }, 500)
}
