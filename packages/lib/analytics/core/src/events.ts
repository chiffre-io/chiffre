import { SessionData } from './session'
import { PageVisitData } from './navigation'

export interface Event<T, K extends keyof T> {
  type: K
  time: number
  data?: T[K]
}

// ---

export interface GenericDataPoint<T, Meta = any> {
  name: string
  value: T
  meta?: Meta
}

export type GenericEvents = {
  'generic:number': GenericDataPoint<number>
  'generic:numbers': GenericDataPoint<number>[]
  'generic:string': GenericDataPoint<string>
  'generic:strings': GenericDataPoint<string>[]
}

export interface BrowserEventData {
  sid: string
  path: string
}

export type BrowserDataPoint<T = {}> = BrowserEventData & T

export type BrowserEvents = {
  'session:start': BrowserDataPoint<SessionData>
  'session:end': BrowserDataPoint
  'page:visit': BrowserDataPoint<PageVisitData>
}

function eventFactory<Events>() {
  return function createEvent<K extends keyof Events>(
    type: K,
    data?: Events[K]
  ): Event<Events, K> {
    return {
      type,
      time: Date.now(),
      data
    }
  }
}

export const createGenericEvent = eventFactory<GenericEvents>()
export const createBrowserEvent = eventFactory<BrowserEvents>()

export type EventSender = <T>(event: Event<T, keyof T>) => void
