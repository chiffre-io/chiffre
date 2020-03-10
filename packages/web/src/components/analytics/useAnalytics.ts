import React from 'react'
import {
  BrowserEvent,
  isSessionStartEvent,
  isPageVisitEvent
} from '@chiffre/analytics-core'
import {
  LeaderboardEntry,
  NumericStats,
  BrowserEventsProcessor,
  CounterMap
} from '@chiffre/analytics-processing'
import { EventRow, useDatabase } from '../../engine/db'
import { TimeRange } from '../../hooks/useTimeRange'
import countriesMap from '../../ui/countries.json'

export interface Analytics {
  data: EventRow[]
  sessions: [string, BrowserEvent[]][]
  visits: number
  pageViews: number
  pageCount: LeaderboardEntry[]
  timeOnSite: NumericStats
  timeOnPage: LeaderboardEntry[]
  countries: LeaderboardEntry[]
  referrers: LeaderboardEntry[]
  userAgents: LeaderboardEntry[]
  operatingSystemsWithVersion: LeaderboardEntry[]
  operatingSystems: LeaderboardEntry[]
  languages: LeaderboardEntry[]
  viewportWidths: LeaderboardEntry[]
  browsers: LeaderboardEntry[]
}

export default function useAnalytics(
  projectID: string,
  timeRange?: TimeRange
): Analytics {
  const data = useData(projectID, timeRange)
  const analytics: Analytics = React.useMemo(() => {
    const bep = new BrowserEventsProcessor()
    const countries = new CounterMap()
    for (const event of data) {
      bep.process(event as BrowserEvent)
      countries.count(event.country)
    }
    return {
      data,
      sessions: Array.from(bep.sessions.entries()),
      visits: bep.sessions.size,
      pageViews: data.filter(
        event => isSessionStartEvent(event) || isPageVisitEvent(event)
      ).length,
      pageCount: bep.pageCount.leaderboard,
      timeOnSite: bep.timeOnSite,
      timeOnPage: bep.timeOnPageLeaderboard,
      countries: countries.leaderboard.map(({ key: iso, ...entry }) => ({
        key: !!countriesMap[iso]
          ? `${countriesMap[iso].flag} ${countriesMap[iso].name}`
          : 'N.A.',
        ...entry
      })),
      referrers: bep.referrers.leaderboard,
      userAgents: bep.userAgents.leaderboard,
      operatingSystemsWithVersion: bep.osWithVersion.leaderboard,
      operatingSystems: bep.os.leaderboard,
      languages: bep.lang.leaderboard,
      viewportWidths: bep.viewportWidth.leaderboard,
      browsers: bep.browsers.leaderboard
    }
  }, [data])

  return analytics
}

function useData(projectID: string, timeRange?: TimeRange) {
  const db = useDatabase()
  const [data, setData] = React.useState<EventRow[]>([])

  React.useEffect(() => {
    if (!db) {
      return
    }
    if (!timeRange) {
      return setData([])
    }
    db.events
      .where('time')
      .between(
        timeRange.after?.valueOf() || 0,
        timeRange.before?.valueOf() || Infinity,
        true,
        false
      )
      .and(evt => evt.projectID === projectID)
      .toArray()
      .then(setData)
  }, [timeRange, db, projectID])

  return data
}
