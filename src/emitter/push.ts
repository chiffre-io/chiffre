import { Event } from './events'
import { EmitterConfig } from './config'
import { encryptMessage } from './crypto'

type AnyEvent = Event<any, any>

export const pushEvent = async (
  event: AnyEvent,
  config: EmitterConfig
): Promise<boolean> => {
  const json = JSON.stringify(event)
  const message = encryptMessage(json, config)
  console.log('sending message', message)
  const sent = navigator.sendBeacon(config.pushURL, message)
  return sent
}
