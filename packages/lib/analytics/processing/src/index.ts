import {
  BrowserEvent,
  SessionData,
  GenericEvent,
  isSessionStartEvent,
  isGenericStringEvent,
  isGenericNumberEvent,
  isGenericNumbersEvent,
  isGenericStringsEvent,
  isBrowserEvent,
  isSessionEndEvent
} from '@chiffre/analytics-core'
import Bowser from 'bowser'

export interface LeaderboardEntry<K = string> {
  key: K
  score: number
  percent: number
}

export class CounterMap<K = string> {
  private _map: Map<K, number>

  constructor() {
    this._map = new Map()
  }

  public count(key: K) {
    this._map.set(key, (this._map.get(key) || 0) + 1)
  }

  public get leaderboard(): LeaderboardEntry<K>[] {
    const sum = Array.from(this._map.values()).reduce((s, c) => s + c, 0)
    return Array.from(this._map.entries())
      .map(([key, count]) => ({
        key,
        score: count,
        percent: (100 * count) / sum
      }))
      .sort((a, b) => b.score - a.score)
  }
}

// --

function findSessionStart(events: BrowserEvent[]) {
  return events.find(isSessionStartEvent)
}

export interface NumericStats {
  min: number
  max: number
  avg: number
}

export interface ReturningVisitorInfo<E> {
  info: SessionData
  timeSinceLastVisit: number
  session: E[]
}

export class BrowserEventsProcessor<E extends BrowserEvent> {
  private _sessionMap: Map<string, E[]>
  browsers: CounterMap
  pageCount: CounterMap
  referrers: CounterMap
  userAgents: CounterMap
  lang: CounterMap
  os: CounterMap
  osWithVersion: CounterMap
  viewportWidth: CounterMap<number>

  constructor() {
    this._sessionMap = new Map()
    this.pageCount = new CounterMap()
    this.referrers = new CounterMap()
    this.userAgents = new CounterMap()
    this.os = new CounterMap()
    this.osWithVersion = new CounterMap()
    this.lang = new CounterMap()
    this.viewportWidth = new CounterMap<number>()
    this.browsers = new CounterMap()
  }

  public process(event: E) {
    if (!isBrowserEvent(event)) {
      return
    }
    const key = event.data?.sid
    const sessionEvents = this._sessionMap.get(key) || []
    this._sessionMap.set(
      key,
      [...sessionEvents, event].sort((a, b) => a.time - b.time)
    )
    this.pageCount.count(event.data?.path)
    if (isSessionStartEvent(event)) {
      const ua = Bowser.parse(event.data.ua)
      this.referrers.count(event.data.ref)
      this.userAgents.count(
        `${ua.browser.name} ${ua.browser.version || '(unknown)'}`
      )
      this.osWithVersion.count(`${ua.os.name} ${ua.os.version || '(unknown)'}`)
      this.os.count(ua.os.name)
      this.lang.count(event.data.lang)
      this.viewportWidth.count(event.data.vp.w)
      this.browsers.count(ua.browser.name)
    }
  }

  public get sessions(): Map<string, E[]> {
    return this._sessionMap
  }

  public get sessionDurations(): Map<string, number> {
    return new Map(
      Array.from(this._sessionMap.entries())
        .map<[string, number]>(([sid, events]) => {
          if (events.length === 0) {
            return [sid, 0]
          }
          // For events sorted by time:
          const min = events[0].time
          const max = events[events.length - 1].time
          // For unsorted events:
          // const { min, max } = events.reduce(
          //   ({ min, max }, event) => ({
          //     max: Math.max(max, event.time),
          //     min: Math.min(min, event.time)
          //   }),
          //   { min: Infinity, max: 0 }
          // )
          return [sid, max - min]
        })
        .sort((a, b) => a[1] - b[1])
    )
  }

  public get returningVisitors(): Map<string, ReturningVisitorInfo<E>> {
    return new Map(
      Array.from(this.sessions.entries())
        .map<[string, ReturningVisitorInfo<E>]>(([sid, events]) => {
          const start = findSessionStart(events)
          return [
            sid,
            {
              info: start?.data,
              session: events,
              timeSinceLastVisit:
                start?.time - new Date(start?.data?.lvd).valueOf()
            }
          ]
        })
        .filter(([_sid, info]) => info.timeSinceLastVisit >= 0)
    )
  }

  public get timeOnSite(): NumericStats {
    if (this.sessions.size === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0
      }
    }
    const sessionLengths = Array.from(this.sessions.values()).map(
      session => session[session.length - 1].time - session[0].time
    )
    const { min, max, sum } = sessionLengths.reduce(
      ({ min, max, sum }, d) => ({
        min: Math.min(d, min),
        max: Math.max(d, max),
        sum: d + sum
      }),
      { min: Infinity, max: 0, sum: 0 }
    )
    return {
      min,
      max,
      avg: sum / sessionLengths.length
    }
  }

  public get timeOnPage(): Map<string, NumericStats> {
    const rawDurations = new Map<string, number[]>()
    for (const session of this.sessions.values()) {
      interface ReduceVisitor {
        currentPath?: string
        startTime?: number
      }
      session.reduce<ReduceVisitor>((visitor, event, i) => {
        if (i === 0) {
          return {
            currentPath: event.data?.path,
            startTime: event.time
          }
        }
        if (
          event.data?.path === visitor.currentPath ||
          isSessionEndEvent(event)
        ) {
          return visitor
        }
        const timeOnPage = event.time - visitor.startTime
        rawDurations.set(visitor.currentPath, [
          ...(rawDurations.get(visitor.currentPath) || []),
          timeOnPage
        ])
        return {
          currentPath: event.data?.path,
          startTime: event.time
        }
      }, {})
    }
    return new Map(
      Array.from(rawDurations.entries()).map(([path, durations]) => {
        const { min, max, sum } = durations.reduce(
          ({ min, max, sum }, d) => ({
            min: Math.min(d, min),
            max: Math.max(d, max),
            sum: d + sum
          }),
          { min: Infinity, max: 0, sum: 0 }
        )
        return [
          path,
          {
            min,
            max,
            avg: sum / durations.length
          }
        ]
      })
    )
  }

  public get timeOnPageLeaderboard(): LeaderboardEntry[] {
    const sum = Array.from(this.timeOnPage.values()).reduce(
      (s, c) => s + c.avg,
      0
    )
    return Array.from(this.timeOnPage.entries())
      .map(([key, stats]) => ({
        key,
        score: stats.avg,
        percent: (100 * stats.avg) / sum
      }))
      .sort((a, b) => b.score - a.score)
  }
}

// --

export function extractGenericsNames(events: GenericEvent[]) {
  const map = new Map<string, GenericEvent[]>()
  for (const event of events) {
    if (isGenericNumberEvent(event) || isGenericStringEvent(event)) {
      const existing = map.get(event.data.name) || []
      map.set(event.data.name, [...existing, event])
    }
    if (isGenericNumbersEvent(event) || isGenericStringsEvent(event)) {
      for (const datapoint of event.data) {
        const existing = map.get(datapoint.name) || []
        map.set(datapoint.name, [...existing, event])
      }
    }
  }
  return map
}
