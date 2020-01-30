import cors from 'fastify-cors'
import { App } from '../types'
import { pushMessage } from '../db/models/entities/ProjectMessageQueue'
import { projectURLParamsSchema } from './projects.schema'

// --

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
      'x-forwarded-for'
    ],
    methods: ['POST'],
    credentials: false,
    maxAge: 3600 // 1h
  })
  app.post<unknown, UrlParams>(
    '/push/:projectID',
    {
      schema: {
        params: projectURLParamsSchema
      }
    },
    async (req, res) => {
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
        await pushMessage(app.db, projectID, message, performance)
        return res.status(204).send()
      } catch (error) {
        req.log.error(error)
        return res.status(204).send()
      }
    }
  )
}
