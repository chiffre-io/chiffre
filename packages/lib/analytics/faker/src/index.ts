import ms from 'ms'
import faker from 'faker'
import { PiecewiseLinearTaper } from 'tapers'
import { BrowserEvent } from '@chiffre/analytics-core'
import { encryptString, parsePublicKey } from '@chiffre/crypto-box'

const sessionDurationTaper = new PiecewiseLinearTaper([
  3,
  3,
  3,
  4,
  5,
  5,
  6,
  20,
  3600
])

const generateFakeSession = (referenceTime: number): BrowserEvent[] => {
  const startDate = Math.round(referenceTime - Math.random() * ms('30 days'))
  const duration = sessionDurationTaper.map(Math.random()) * 1000
  const endDate = Math.round(startDate + duration)
  const sid = faker.random.uuid()

  const paths = ['/', '/foo', '/bar', '/egg', '/spam']

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
        tzo: faker.random.number({ min: 0, max: 60 * 24 }),
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
  let currentPath = events[0].data.path
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
  publicKey: string
): string[] {
  const pk = parsePublicKey(publicKey)
  return Array(numSessions)
    .fill(0)
    .flatMap(() => generateFakeSession(Date.now()))
    .sort((a, b) => a.time - b.time)
    .map(event => encryptString(JSON.stringify(event), pk))
}
