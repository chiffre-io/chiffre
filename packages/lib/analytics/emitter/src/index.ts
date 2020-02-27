import { encryptString, parsePublicKey } from '@chiffre/crypto-box'
import {
  Event,
  setupSessionListeners,
  setupPageVisitListeners,
  createGenericEvent
} from '@chiffre/analytics-core'
import { Config } from './types'

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
    sendNumber: () => {},
    sendNumbers: () => {},
    sendString: () => {}
  }
  const config = readConfig()
  if (!config) {
    return
  }
  setupSessionListeners(event => sendEvent(event, config))
  setupPageVisitListeners(event => sendEvent(event, config))
  window.chiffre.sendNumber = data => {
    const event = createGenericEvent('generic:number', data)
    sendEvent(event, config)
  }
  window.chiffre.sendNumbers = data => {
    const event = createGenericEvent('generic:numbers', data)
    sendEvent(event, config)
  }
  window.chiffre.sendString = data => {
    const event = createGenericEvent('generic:string', data)
    sendEvent(event, config)
  }
}

setup()
