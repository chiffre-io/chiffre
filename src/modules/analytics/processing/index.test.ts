import { generateFakeSession } from 'modules/analytics/core/faker'
import { BrowserEventsProcessor, CounterMap } from './index'

describe('analytics/processing', () => {
  test('CounterMap', () => {
    const map = new CounterMap()
    map.count('foo')
    map.count('foo')
    map.count('foo')
    map.count('bar')
    map.count('bar')
    expect(map.leaderboard).toEqual([
      {
        key: 'foo',
        score: 3,
        percent: 60
      },
      {
        key: 'bar',
        score: 2,
        percent: 40
      }
    ])
  })

  test('BrowserEventsProcessor', () => {
    const bep = new BrowserEventsProcessor()
    const events = Array(10)
      .fill(0)
      .flatMap(() => generateFakeSession())
      .sort((a, b) => a.time - b.time)
    events.forEach(event => bep.process(event))
    expect(bep.sessions.size).toEqual(10)
  })
})
