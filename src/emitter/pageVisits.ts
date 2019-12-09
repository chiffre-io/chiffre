import { createEvent } from './events'
import { pushEvent } from './push'
import { EmitterConfig } from './config'

export const setupPageVisitListeners = (config: EmitterConfig) => {
  let oldPath = window.location.pathname

  setInterval(() => {
    const newPath = window.location.pathname
    if (oldPath !== newPath) {
      const event = createEvent(`page:navigate`, {
        from: oldPath,
        to: newPath
      })
      pushEvent(event, config)
      oldPath = newPath
    }
  }, 500)
}