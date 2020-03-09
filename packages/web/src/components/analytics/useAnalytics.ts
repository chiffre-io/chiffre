import React from 'react'
import {
  BrowserEvent,
  isSessionStartEvent,
  isPageVisitEvent
} from '@chiffre/analytics-core'
import {
  LeaderboardEntry,
  NumericStats,
  BrowserEventsProcessor
} from '@chiffre/analytics-processing'
import { EventRow, useDatabase } from '../../engine/db'
import { TimeRange } from '../../hooks/useTimeRange'

export interface Analytics {
  data: EventRow[]
  sessions: [string, BrowserEvent[]][]
  visits: number
  pageViews: number
  pageCount: LeaderboardEntry[]
  timeOnSite: NumericStats
  timeOnPage: LeaderboardEntry[]
}

export default function useAnalytics(
  projectID: string,
  timeRange?: TimeRange
): Analytics {
  const data = useData(projectID, timeRange)
  const analytics: Analytics = React.useMemo(() => {
    const bep = new BrowserEventsProcessor()
    for (const event of data) {
      bep.process(event as BrowserEvent)
    }
    return {
      data,
      sessions: Array.from(bep.sessions.entries()),
      visits: bep.sessions.size,
      pageViews: data.filter(
        event => isSessionStartEvent(event) || isPageVisitEvent(event)
      ).length,
      pageCount: bep.pageCountLeaderboard,
      timeOnSite: bep.timeOnSite,
      timeOnPage: bep.timeOnPageLeaderboard
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
