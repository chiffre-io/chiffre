import { EmitterConfig } from './config'
import { setupSessionListeners } from './session'
import { setupPageVisitListeners } from './pageVisits'
import { createEvent } from './events'
import { pushEvent } from './push'

declare global {
  interface Window {
    // The embed script sets this and loads the emitter script
    Chiffre: {
      config: EmitterConfig
      ready: Promise<true>
      sendEvent: (type: string, data?: any) => Promise<boolean>
    }
  }
}

export const entrypoint = async () => {
  try {
    await window.Chiffre.ready // Should be ready by the time
    const { config } = window.Chiffre
    window.Chiffre.sendEvent = async (type: string, data: any = undefined) => {
      const event = createEvent(type, data)
      return await pushEvent(event, config)
    }
    setupSessionListeners(config)
    setupPageVisitListeners(config)
  } catch (error) {
    // What do we do there ?
    // - Store the errors somewhere (in a special event queue for errors)
    // - Send them whenever the service is ready again
    console.error('[Chiffre Setup]', error)
  }
}

entrypoint()
