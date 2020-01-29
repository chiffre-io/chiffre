import { encryptString, parsePublicKey } from '@chiffre/crypto-box'
import {
  Event,
  setupSessionListeners,
  setupPageVisitListeners
} from '@chiffre/analytics-core'

interface Config {
  publicKey: Uint8Array
  pushURL: string
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

function sendEvent(event: Event<any>, config: Config) {
  const tick = performance.now()
  const payload = JSON.stringify(event)
  const message = encryptString(payload, config.publicKey)
  const tock = performance.now()
  let blob = new Blob([message], {
    type: `text/plain;charset=UTF-8;perf=${tock - tick}`
  })
  const sent = navigator.sendBeacon(config.pushURL, blob)
  if (!sent) {
    console.warn('Analytics message failed to send')
  }
  return sent
}

function setup() {
  const config = readConfig()
  if (!config) {
    return
  }
  setupSessionListeners(event => sendEvent(event, config))
  setupPageVisitListeners(event => sendEvent(event, config))
}

setup()
