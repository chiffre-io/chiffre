import { EventProcessor } from './types'
import { Event } from '~/src/emitter/events'

interface SessionDurationState {
  sessions: Map<
    string,
    {
      startedAt: number
    }
  >
}

interface SessionDurationOutput {
  sessionID: string
  duration: number
}

type Processor = EventProcessor<SessionDurationState, SessionDurationOutput>

const defaultState: SessionDurationState = {
  sessions: new Map()
}

const sessionDurationProcessor: Processor = async (
  event: Event,
  state: SessionDurationState = defaultState
) => {
  if (!event) {
    return {
      state
    }
  }

  let output: SessionDurationOutput = undefined
  const { type, sid, time } = event

  if (type === 'session:start') {
    state.sessions.set(sid, { startedAt: time })
  }
  if (type === 'session:end') {
    const session = state.sessions.get(sid)
    if (session) {
      output = {
        sessionID: sid,
        duration: time - session.startedAt
      }
      state.sessions.delete(sid)
    }
  }
  return {
    output,
    state
  }
}

export default sessionDurationProcessor
