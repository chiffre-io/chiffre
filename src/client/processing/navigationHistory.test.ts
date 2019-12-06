import { process } from './processor'
import navigationHistoryProcessor from './navigationHistory'

describe('Processors', () => {
  test('navigationHistory', async () => {
    const events = [
      {
        id: '18c017d7-aa80-4571-9de9-aaf75eab8a66',
        event: {
          v: 1,
          type: 'session:start',
          sid: 'b54AiuBwFjUmJdkcTSfQ9',
          time: 1575635924957,
          path: '/login',
          data: {
            ua:
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0',
            lang: 'en-US',
            vp: {
              w: 656,
              h: 803
            }
          }
        }
      },
      {
        id: '7e7afaf7-5107-4857-9a97-66f793284c49',
        event: {
          v: 1,
          type: 'page:navigate',
          sid: 'b54AiuBwFjUmJdkcTSfQ9',
          time: 1575635937066,
          path: '/dashboard',
          data: {
            from: '/login',
            to: '/dashboard'
          }
        }
      },
      {
        id: '01068b0a-88f9-42be-bae2-03afbc7c0435',
        event: {
          v: 1,
          type: 'session:end',
          sid: 'b54AiuBwFjUmJdkcTSfQ9',
          time: 1575636119940,
          path: '/dashboard'
        }
      }
    ]

    const result = await process(
      events.map(e => e.event),
      navigationHistoryProcessor
    )

    expect(result).toEqual([
      {
        sessionID: 'b54AiuBwFjUmJdkcTSfQ9',
        history: [
          { path: '/login', duration: 12109 },
          { path: '/dashboard', duration: 182874 }
        ]
      }
    ])
  })
})
