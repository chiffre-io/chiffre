import fp from 'fastify-plugin'
import { performance } from 'perf_hooks'
import { App } from '../types'
import { pushMessage } from '../db/models/entities/ProjectMessageQueue'
import {
  KeyIDs,
  PubSubChannels,
  SerializedMessage,
  getProjectKey,
  getProjectIDFromKey
} from '@chiffre/push'

export interface IngressDecoration {
  pending: boolean
  promise: Promise<number>
}

// --

async function processProjectIngress(app: App, projectID: string) {
  const redis = app.redis.ingressData
  const metrics = []
  const dataKey = getProjectKey(projectID, KeyIDs.data)

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

  return await redis.llen(dataKey)
}

// --

async function processIngress(app: App) {
  try {
    const tick = performance.now()
    const projectDataKeys = await app.redis.ingressData.keys(
      getProjectKey('*', KeyIDs.data)
    )
    const projectIDs = projectDataKeys.map(k => getProjectIDFromKey(k))
    let messagesRemaining = 0
    for (const projectID of projectIDs) {
      messagesRemaining += await processProjectIngress(app, projectID)
    }
    const tock = performance.now()
    const time = tock - tick
    app.log.info({
      msg: 'processIngress performance',
      time
    })
    return messagesRemaining
  } catch (err) {
    app.log.error({
      err,
      task: 'processIngress'
    })
    app.sentry.report(err)
    return null
  }
}

// --

export default fp((app: App, _, next) => {
  const decoration: IngressDecoration = {
    pending: false,
    promise: Promise.resolve(0)
  }
  app.decorate('ingress', decoration)

  app.ready().then(() => {
    app.redis.ingressDataSub.subscribe(PubSubChannels.newDataAvailable)

    function startIngressProcessing() {
      if (app.ingress.pending) {
        // Ignore re-entrance to avoid buildup
        // todo: Count up to check for buildup and report
        app.log.info({
          msg: 're-entrance',
          task: 'processIngress'
        })
        return
      }
      app.ingress.pending = true
      app.ingress.promise = processIngress(app).finally(() => {
        app.ingress.pending = false
      })
      // Re-trigger if there are still messages to process
      app.ingress.promise.then(messagesRemaining => {
        if (!messagesRemaining) {
          return
        }
        app.log.info({
          msg: 'More messages remaining',
          messagesRemaining,
          task: 'processIngress'
        })
        startIngressProcessing()
      })
    }

    app.redis.ingressDataSub.on('message', () => startIngressProcessing())
  })
  next()
})
