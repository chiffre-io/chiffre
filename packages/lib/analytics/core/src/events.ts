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
export type GenericEvent = Event<GenericEvents, keyof GenericEvents>

export function isGenericEvent(event: AllEvents): event is GenericEvent {
  return (
    isGenericNumberEvent(event) ||
    isGenericNumbersEvent(event) ||
    isGenericStringEvent(event) ||
    isGenericStringsEvent(event)
  )
}
export function isGenericNumberEvent(
  event: AllEvents
): event is Event<GenericEvents, 'generic:number'> {
  return event.type === 'generic:number'
}
export function isGenericNumbersEvent(
  event: AllEvents
): event is Event<GenericEvents, 'generic:numbers'> {
  return event.type === 'generic:numbers'
}
export function isGenericStringEvent(
  event: AllEvents
): event is Event<GenericEvents, 'generic:string'> {
  return event.type === 'generic:string'
}
export function isGenericStringsEvent(
  event: AllEvents
): event is Event<GenericEvents, 'generic:strings'> {
  return event.type === 'generic:strings'
}

// --

export interface BrowserEventData {
  sid: string
  path: string
}

export type BrowserDataPoint<T = {}> = BrowserEventData & T

export type BrowserEvents = {
  'session:start': BrowserDataPoint<SessionData>
  'session:end': BrowserDataPoint
  'page:visit': BrowserDataPoint<PageVisitData>
  'page:hide': BrowserDataPoint
  'page:show': BrowserDataPoint
}
export type BrowserEvent = Event<BrowserEvents, keyof BrowserEvents>

export function isBrowserEvent(event: AllEvents): event is BrowserEvent {
  return (
    isSessionStartEvent(event) ||
    isSessionEndEvent(event) ||
    isPageVisitEvent(event) ||
    isPageHideEvent(event) ||
    isPageShowEvent(event)
  )
}
export function isSessionStartEvent(
  event: AllEvents
): event is Event<BrowserEvents, 'session:start'> {
  return event.type === 'session:start'
}
export function isSessionEndEvent(
  event: AllEvents
): event is Event<BrowserEvents, 'session:end'> {
  return event.type === 'session:end'
}
export function isPageVisitEvent(
  event: AllEvents
): event is Event<BrowserEvents, 'page:visit'> {
  return event.type === 'page:visit'
}
export function isPageHideEvent(
  event: AllEvents
): event is Event<BrowserEvents, 'page:hide'> {
  return event.type === 'page:hide'
}
export function isPageShowEvent(
  event: AllEvents
): event is Event<BrowserEvents, 'page:show'> {
  return event.type === 'page:show'
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

export type AllEvents = GenericEvent | BrowserEvent
