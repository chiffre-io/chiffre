import { App } from '../index'
import { SerializedMessage } from '../types'

interface QueryParams {
  perf?: string
}

interface UrlParams {
  projectID: string
}

export default async (app: App) => {
  app.post<QueryParams, UrlParams>('/:projectID', async (req, res) => {
    const { projectID } = req.params
    // todo: Validate projectIDs against a whitelist to avoid spam.
    try {
      const message: string = req.body
      if (!message.startsWith('v1.naclbox.')) {
        // Don't store garbage
        return res.status(204).send()
      }
      const messageObject: SerializedMessage = {
        msg: message,
        perf: parseInt(req.query.perf || '-1'),
        received: Date.now(),
        country: req.headers['cf-ipcountry']
      }
      await app.redis.lpush(projectID, JSON.stringify(messageObject))
      return res.status(204).send()
    } catch (error) {
      req.log.error(error)
      return res.status(204).send()
    }
  })
}
