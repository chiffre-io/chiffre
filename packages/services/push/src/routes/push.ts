import cors from 'fastify-cors'
import { App } from '../index'

interface QueryParams {
  perf?: number
}

interface UrlParams {
  projectID: string
}

export default async (app: App) => {
  app.register(cors, {
    origin: true,
    allowedHeaders: [
      'accept',
      'content-type',
      'origin',
      'user-agent',
      'x-forwarded-for',
      'cf-ipcountry'
    ],
    methods: ['POST'],
    credentials: true, // sendBeacon always sends credentials
    maxAge: 3600 // 1h
  })
  app.post<QueryParams, UrlParams>('/:projectID', async (req, res) => {
    const { projectID } = req.params
    try {
      const message: string = req.body
      if (!message.startsWith('v1.naclbox.')) {
        // Don't store garbage
        return res.status(204).send()
      }
      const blob = JSON.stringify({
        msg: message,
        perf: req.query.perf || -1,
        rat: Date.now(), // Received at
        country: req.headers['cf-ipcountry']
      })
      await app.redis.lpush(projectID, blob)
      return res.status(204).send()
    } catch (error) {
      req.log.error(error)
      return res.status(204).send()
    }
  })
}
