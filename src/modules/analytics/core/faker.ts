import faker from 'faker'
import { BrowserEvent } from 'modules/analytics/core'
import { encryptString, parsePublicKey } from 'modules/crypto/box'
import ms from 'ms'
import { PiecewiseLinearTaper } from 'tapers'

const sessionDurationTaper = new PiecewiseLinearTaper([
  3, 3, 3, 4, 5, 5, 6, 20, 3600
])

export interface FakeSessionGeneratorArgs {
  referenceTimestamp: number
  maxAge: string //< Anything `ms` can understand
  maxDurationMs: number
  paths: string[]
}

export const generateFakeSession = ({
  referenceTimestamp = Date.now(),
  maxAge = '30 days',
  maxDurationMs = 1000,
  paths = ['/', '/foo', '/bar', '/egg', '/spam']
}: Partial<FakeSessionGeneratorArgs> = {}): BrowserEvent[] => {
  const startDate = Math.round(referenceTimestamp - Math.random() * ms(maxAge))
  const duration = sessionDurationTaper.map(Math.random()) * maxDurationMs
  const endDate = Math.round(startDate + duration)
  const sid = faker.datatype.uuid()

  const events: BrowserEvent[] = [
    {
      time: startDate,
      type: 'session:start',
      data: {
        lang: faker.random.arrayElement(['en-US', 'en-GB', 'fr-FR']),
        os: faker.random.arrayElement(['Win32', 'MacIntel']),
        path: faker.random.arrayElement(paths),
        ref: faker.random.arrayElement([
          'google.com',
          'twitter.com',
          'facebook.com'
        ]),
        sid,
        tzo: faker.datatype.number({ min: 0, max: 60 * 24 }),
        ua: faker.internet.userAgent(),
        vp: faker.random.arrayElement([
          {
            w: 320,
            h: 640
          },
          {
            w: 1440,
            h: 900
          },
          {
            w: 1280,
            h: 600
          }
        ])
      }
    }
  ]
  let currentPath = events[0].data!.path
  Array(Math.round(Math.random() * 3))
    .fill(undefined)
    .forEach(() => {
      const eventTime =
        startDate + Math.round(Math.random() * (endDate - startDate))
      const from = currentPath
      const to = faker.random.arrayElement(paths.filter(p => p !== currentPath))
      currentPath = to
      events.push({
        type: 'page:visit',
        time: eventTime,
        data: {
          sid,
          path: currentPath,
          from
        }
      })
    })
  events.push({
    time: endDate,
    type: 'session:end',
    data: {
      path: currentPath,
      sid
    }
  })
  return events
}

export default function generateFakePayloadStream(
  numSessions: number,
  publicKey: string,
  generatorArgs?: Partial<FakeSessionGeneratorArgs>
): string[] {
  const pk = parsePublicKey(publicKey)
  return Array(numSessions)
    .fill(0)
    .flatMap(() => generateFakeSession(generatorArgs))
    .sort((a, b) => a.time - b.time)
    .map(event => encryptString(JSON.stringify(event), pk))
}
