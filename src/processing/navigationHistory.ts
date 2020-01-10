import { EventProcessor } from './types'
import { Event } from '~/src/emitter/events'

interface HistoryState {
  path: string
  duration: number
}

interface State {
  sessions: Map<
    string,
    {
      history: HistoryState[]
      current?: {
        path: string
        startedAt: number
      }
    }
  >
}

interface Output {
  sessionID: string
  history: HistoryState[]
}

type Processor = EventProcessor<State, Output>

const defaultState: State = {
  sessions: new Map()
}

const navigationHistoryProcessor: Processor = async (
  event: Event,
  state: State = defaultState
) => {
  if (!event) {
    return {
      state
    }
  }

  let output: Output = undefined
  const { type, sid, time } = event

  if (type === 'session:start') {
    state.sessions.set(sid, {
      history: [],
      current: {
        path: event.path,
        startedAt: time
      }
    })
  }
  if (type === 'session:end') {
    const session = state.sessions.get(sid)
    if (session) {
      // Push last event (leave)
      session.history.push({
        path: session.current.path || event.path,
        duration: time - session.current.startedAt
      })
      output = {
        sessionID: sid,
        history: session.history
      }
      state.sessions.delete(sid)
    }
  }
  if (type === 'page:navigate') {
    const { from, to } = event.data
    const session = state.sessions.get(sid)
    if (session) {
      session.history.push({
        path: from,
        duration: time - session.current.startedAt
      })
      session.current = {
        path: to,
        startedAt: time
      }
    }
  }
  return {
    output,
    state
  }
}

export default navigationHistoryProcessor
