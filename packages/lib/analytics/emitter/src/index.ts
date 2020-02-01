import { encryptString, parsePublicKey } from '@chiffre/crypto-box'
import {
  Event,
  setupSessionListeners,
  setupPageVisitListeners,
  createGenericEvent,
  GenericDataPoint
} from '@chiffre/analytics-core'

interface Config {
  publicKey: Uint8Array
  pushURL: string
}

declare global {
  interface Window {
    chiffre: {
      // Generic events
      trackNumber: (data: GenericDataPoint<number>) => void
      trackNumbers: (data: GenericDataPoint<number>[]) => void
    }
  }
}

function readConfig() {
  try {
    const config = JSON.parse(
      document.getElementById('chiffre:analytics-config').innerText
    )
    return {
      publicKey: parsePublicKey(config.publicKey),
      pushURL: config.pushURL || 'https://push.chiffre.io'
    }
  } catch (error) {
    console.error('Failed to load Chiffre analytics configuration:', error)
    return null
  }
}

function sendEvent(event: Event<any, any>, config: Config) {
  const tick = performance.now()
  const payload = JSON.stringify(event)
  const message = encryptString(payload, config.publicKey)
  const tock = performance.now()
  const url = `${config.pushURL}?perf=${tock - tick}`
  const sent = navigator.sendBeacon(url, message)
  if (!sent) {
    console.warn('Analytics message failed to send')
  }
  return sent
}

function setup() {
  window.chiffre = {
    trackNumber: () => {},
    trackNumbers: () => {}
  }
  const config = readConfig()
  if (!config) {
    return
  }
  setupSessionListeners(event => sendEvent(event, config))
  setupPageVisitListeners(event => sendEvent(event, config))
  window.chiffre.trackNumber = data => {
    const event = createGenericEvent('generic:number', data)
    sendEvent(event, config)
  }
  window.chiffre.trackNumbers = data => {
    const event = createGenericEvent('generic:numbers', data)
    sendEvent(event, config)
  }
}

setup()
