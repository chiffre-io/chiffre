import { EmitterConfig } from './config'
import { setupSessionListeners } from './session'

declare global {
  interface Window {
    // The embed script sets this and loads the emitter script
    Chiffre: EmitterConfig
  }
}

export const entrypoint = async () => {
  try {
    const config = window.Chiffre
    setupSessionListeners(config)
  } catch (error) {
    // What do we do there ?
    // - Store the errors somewhere (in a special event queue for errors)
    // - Send them whenever the service is ready again
    console.error('[Chiffre Setup]', error)
  }
}

entrypoint()
