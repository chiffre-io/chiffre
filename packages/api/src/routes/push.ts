import { App } from '../types'
import { pushMessage } from '../db/models/entities/ProjectMessageQueue'

// --

interface UrlParams {
  projectID: string
}

export default async (app: App) => {
  app.post<unknown, UrlParams>(
    '/push/:projectID',
    {
      schema: {
        params: {
          projectID: {
            type: 'string'
          }
        }
      }
    },
    async (req, res) => {
      const getPerformance = () => {
        try {
          const match = req.headers['content-type'].match(/perf=(?<perf>\d+)$/)
          const { perf } = match.groups
          return parseInt(perf, 10)
        } catch (error) {
          console.error(error)
          return -1
        }
      }

      const { projectID } = req.params
      try {
        const message = req.body
        const performance = getPerformance()
        pushMessage(app.db, projectID, message, performance)
        return res.status(204).send(null)
      } catch (error) {
        console.error(error)
        return res.status(204).send(null)
      }
    }
  )
}
