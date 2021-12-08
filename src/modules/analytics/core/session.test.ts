/**
 * @jest-environment jsdom
 */

import {
  isBrowserEvent,
  isSessionEndEvent,
  isSessionStartEvent
} from './events'
import { sessionEnd, sessionStart } from './session'

describe('analytics/core', () => {
  test('sessionStart', () => {
    const event = sessionStart()
    expect(event.type).toEqual('session:start')
    expect(isBrowserEvent(event)).toEqual(true)
    expect(isSessionStartEvent(event)).toEqual(true)
  })

  test('sessionEnd', () => {
    const event = sessionEnd()
    expect(event.type).toEqual('session:end')
    expect(isBrowserEvent(event)).toEqual(true)
    expect(isSessionEndEvent(event)).toEqual(true)
  })
})
