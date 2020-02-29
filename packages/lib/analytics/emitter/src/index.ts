import { encryptString, parsePublicKey } from '@chiffre/crypto-box'
import {
  Event,
  setupSessionListeners,
  setupPageVisitListeners,
  createGenericEvent
} from '@chiffre/analytics-core'
import { Config } from './types'

function readConfig(): Config {
  try {
    const config = JSON.parse(
      document.getElementById('chiffre:analytics-config').innerText
    )
    if (!config.pushURL) {
      throw new Error('Missing pushURL')
    }
    return {
      publicKey: parsePublicKey(config.publicKey),
      pushURL: config.pushURL
    }
  } catch (error) {
    console.error(
      '[Chiffre] Failed to load Chiffre analytics configuration:',
      error
    )
    return null
  }
}

function sendEvent(event: Event<any, any>, config: Config) {
  const tick = performance.now()
  const payload = JSON.stringify(event)
  const message = encryptString(payload, config.publicKey)
  const tock = performance.now()
  const perf = Math.round(tock - tick)
  const url = `${config.pushURL}?perf=${perf}`
  if (window.localStorage.getItem('chiffre:debug') === 'true') {
    console.dir({
      event,
      message,
      perf,
      url
    })
  }
  if (window.localStorage.getItem('chiffre:no-send') === 'true') {
    console.info('[Chiffre] Skip sending message (chiffre:no-send is set)', {
      payload: message,
      perf
    })
    return false
  }

  const sent = navigator.sendBeacon(url, message)
  if (!sent) {
    console.warn('[Chiffre] Analytics message failed to send')
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
