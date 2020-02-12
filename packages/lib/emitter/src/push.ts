import { Event } from './events'
import { EmitterConfig } from './config'
import { encryptMessage } from './crypto'

export const pushEvent = async (
  event: Event<any>,
  config: EmitterConfig
): Promise<boolean> => {
  const tick = performance.now()
  const json = JSON.stringify(event)
  const message = encryptMessage(json, config)
  const tock = performance.now()
  let blob = new Blob([message], {
    type: `text/plain;charset=UTF-8;perf=${Math.round(tock - tick)}`
  })
  const sent = navigator.sendBeacon(config.pushURL, blob)
  if (!sent) {
    console.warn('Analytics message failed to send')
  }
  return sent
}
