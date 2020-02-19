import fp from 'fastify-plugin'
import { performance } from 'perf_hooks'
import { App } from '../types'
import { pushMessage } from '../db/models/entities/ProjectMessageQueue'
import {
  SerializedMessage,
  getProjectDataKey,
  getProjectIDFromDataKey
} from '@chiffre/push'

export interface IngressDecoration {
  intervalID: NodeJS.Timeout
}

async function processProjectIngress(app: App, projectID: string) {
  const redis = app.redis.ingress
  const metrics = []
  const dataKey = getProjectDataKey(projectID)

  // Read up to 32 items
  const items = (await redis.lrange(dataKey, 0, 31)).reverse()
  while (items.length > 0) {
    try {
      const item = items.pop()

      const {
        payload,
        perf,
        country,
        received
      }: SerializedMessage = JSON.parse(item)
      await pushMessage(app.db, {
        projectID,
        message: payload,
        performance: perf,
        receivedAt: new Date(received),
        country
      })
      await redis.lrem(dataKey, 1, item)
      metrics.push({
        processingTime: Date.now() - received,
        perf,
        country
      })
    } catch (err) {
      app.log.error({
        msg: 'Error processing incoming message',
        err,
        projectID,
        task: 'processIngress'
      })
      app.sentry.report(err)
    }
  }
  app.log.info({
    msg: `Processed ${metrics.length} messages`,
    projectID,
    task: 'processIngress'
  })
  app.log.info({
    msg: 'processProjectIngress metrics',
    projectID,
    metrics,
    task: 'processIngress'
  })
}

async function processIngress(app: App) {
  const projectDataKeys = await app.redis.ingress.keys(getProjectDataKey('*'))
  const projectIDs = projectDataKeys.map(k => getProjectIDFromDataKey(k))
  for (const projectID of projectIDs) {
    await processProjectIngress(app, projectID)
  }
}

// --

const INGRESS_TIMEOUT_MS = 5000

export default fp((app: App, _, next) => {
  const decoration: IngressDecoration = {
    intervalID: null
  }
  app.decorate('ingress', decoration)
  app.ready().then(() => {
    app.ingress.intervalID = setInterval(async () => {
      try {
        const tick = performance.now()
        await processIngress(app)
        const tock = performance.now()
        const time = tock - tick
        const usage = time / INGRESS_TIMEOUT_MS
        app.log.trace({
          msg: 'processIngress performance',
          time,
          usage
        })
        if (usage >= 0.75) {
          app.log.warn({
            msg: 'processIngress performance warning',
            time,
            usage
          })
        }
        if (usage >= 0.99) {
          app.sentry.report(new Error('Process Ingress: high usage detected'))
        }
      } catch (err) {
        app.log.error({
          err,
          task: 'processIngress'
        })
        app.sentry.report(err)
      }
    }, INGRESS_TIMEOUT_MS)
  })
  next()
})
