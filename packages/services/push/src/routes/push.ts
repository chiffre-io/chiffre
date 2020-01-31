import cors from 'fastify-cors'
import { App } from '../index'

interface UrlParams {
  projectID: string
}

export default async (app: App) => {
  app.register(cors, {
    origin: '*',
    allowedHeaders: [
      'accept',
      'content-type',
      'origin',
      'user-agent',
      'x-forwarded-for',
      'cf-ipcountry'
    ],
    methods: ['POST'],
    maxAge: 3600 // 1h
  })
  app.post<unknown, UrlParams>('/:projectID', async (req, res) => {
    const getPerformance = () => {
      try {
        const match = req.headers['content-type'].match(/perf=(?<perf>\d+)$/)
        const { perf } = match.groups
        return parseInt(perf, 10)
      } catch (error) {
        req.log.error(error)
        return -1
      }
    }

    const { projectID } = req.params
    try {
      const message = req.body
      const performance = getPerformance()
      const blob = JSON.stringify({
        m: message,
        p: performance,
        c: '' // Country, todo
      })
      await app.redis.lpush(projectID, blob)
      return res.status(204).send()
    } catch (error) {
      req.log.error(error)
      return res.status(204).send()
    }
  })
}
