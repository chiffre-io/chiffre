import {
  createBrowserEvent,
  createGenericEvent,
  Event,
  setupPageVisitListeners,
  setupSessionListeners
} from 'modules/analytics/core'
import { encryptString, parsePublicKey } from 'modules/crypto/box'
import { Config } from './types'
import { version } from './version'

export function readConfig(): Config | null {
  try {
    const config = JSON.parse(
      document.getElementById('chiffre:analytics-config')?.innerText || '{}'
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

function makeUrl(config: Config, perf: number, xhr: string) {
  const query = ['v=' + version, 'xhr=' + xhr, 'perf=' + perf.toFixed()].join(
    '&'
  )
  return `${config.pushURL}?${query}`
}

export function sendEvent(
  event: Event<any, any>,
  config: Config,
  preferSendBeacon = false
) {
  const tick = performance.now()
  if (
    window.location.hostname.match(/^(localhost|127\.0\.0\.1)$/) &&
    window.localStorage?.getItem('chiffre:allowLocalhost') !== 'true'
  ) {
    // Don't send events from localhost
    return
  }
  if (Array.isArray(config.ignorePaths)) {
    for (const path of config.ignorePaths) {
      if (window.location.pathname.startsWith(path)) {
        return // Do not send event
      }
    }
  }
  const json = JSON.stringify(event)
  const payload = encryptString(json, config.publicKey)
  const tock = performance.now()
  const perf = Math.round(tock - tick)
  if (window.localStorage?.getItem('chiffre:debug') === 'true') {
    console.dir({
      event,
      payload,
      perf,
      version
    })
  }
  if (window.localStorage?.getItem('chiffre:no-send') === 'true') {
    console.info('[Chiffre] Not sending message', {
      payload,
      perf
    })
    return false
  }

  const beaconUrl = makeUrl(config, perf, 'beacon')
  const fetchUrl = makeUrl(config, perf, 'fetch')
  const imageUrl = makeUrl(config, perf, 'img')

  type Strategy = [(url: string, payload: string) => boolean, string]
  const strategies: Strategy[] = preferSendBeacon
    ? [
        [sendViaBeacon, beaconUrl],
        [sendViaFetch, fetchUrl],
        [sendViaImageGet, imageUrl]
      ]
    : [
        [sendViaFetch, fetchUrl],
        [sendViaBeacon, beaconUrl],
        [sendViaImageGet, imageUrl]
      ]
  for (const [send, url] of strategies) {
    if (send(url, payload)) {
      break
    }
  }
  return true
}

function sendViaFetch(url: string, payload: string) {
  if (!('fetch' in window)) {
    return false
  }
  fetch(url, {
    method: 'POST',
    body: payload,
    credentials: 'omit',
    cache: 'no-store',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain'
    }
  })
  return true
}
function sendViaBeacon(url: string, payload: string) {
  if (
    typeof navigator.sendBeacon === 'function' &&
    navigator.sendBeacon(url, payload)
  ) {
    return true
  }
  return false
}
function sendViaImageGet(url: string, payload: string) {
  const img = new Image()
  img.src = `${url}&payload=${payload}`
  return true
}

export function setup() {
  window.chiffre = {
    sendNumber: () => {},
    sendNumbers: () => {},
    sendString: () => {},
    sendStrings: () => {}
  }
  const config = readConfig()
  if (!config) {
    return
  }
  if (navigator.doNotTrack === '1') {
    // With DoNotTrack, we send a single event for page views, without
    // any session tracking or other visitor information.
    sendEvent(createBrowserEvent('session:dnt', null), config)
  } else {
    setupSessionListeners((event, lowPriority = false) =>
      sendEvent(event, config, lowPriority)
    )
    setupPageVisitListeners(event => sendEvent(event, config))
  }
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
  window.chiffre.sendStrings = data => {
    const event = createGenericEvent('generic:strings', data)
    sendEvent(event, config)
  }
}
