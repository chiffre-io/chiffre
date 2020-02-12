import { App } from '../types'
import main, { TaskRunner } from './task'
import { pushMessage } from '../db/models/entities/ProjectMessageQueue'
import { SerializedMessage } from '@chiffre/push-types'

async function processProjectIngress(app: App, projectID: string) {
  const redis = app.redis.ingress
  const metrics = []

  // Read up to 32 items
  const items = (await redis.lrange(projectID, 0, 31)).reverse()
  while (items.length > 0) {
    try {
      const item = items.pop()
      const { msg, perf, country, received }: SerializedMessage = JSON.parse(
        item
      )
      await pushMessage(app.db, projectID, msg, perf, country)
      await redis.lrem(projectID, 1, item)
      metrics.push({
        processingTime: Date.now() - received,
        perf,
        country
      })
    } catch (err) {
      app.log.error({
        msg: 'Error processing incoming message',
        err,
        projectID
      })
    }
  }
  app.log.info({
    msg: `Processed ${metrics.length} messages`,
    projectID,
    task: run.name
  })
  app.log.info({
    msg: 'processProjectIngress metrics',
    projectID,
    metrics,
    task: run.name
  })
}

const run: TaskRunner = async function processIngress(app: App) {
  const projectIDs = await app.redis.ingress.keys('*')
  for (const projectID of projectIDs) {
    await processProjectIngress(app, projectID)
  }
}

if (require.main === module) {
  main(run)
}
