import { App } from '../types'
import {
  findMessagesForProject,
  ProjectMessage
} from '../db/models/entities/ProjectMessageQueue'
import { MessageQueueResponse } from './queues.schema'

// --

interface UrlParams {
  projectID: string
}

interface QueryParams {
  before?: string
  after?: string
}

const lightenMessage = (message: ProjectMessage): MessageQueueResponse => {
  const { projectID, performance, ...rest } = message
  return rest
}

export default async (app: App) => {
  app.get<QueryParams, UrlParams>(
    '/queues/:projectID',
    {
      preValidation: [app.authenticate()],
      logLevel: 'warn'
    },
    async (req, res) => {
      const { projectID } = req.params
      // todo: Make sure we have the right access
      // todo: Add more strict validation for before & after parameters
      const messages = await findMessagesForProject(
        app.db,
        projectID,
        req.query.before ? new Date(parseInt(req.query.before)) : undefined,
        req.query.after ? new Date(parseInt(req.query.after)) : undefined
      )
      return res.send(messages.map(lightenMessage))
    }
  )
}
