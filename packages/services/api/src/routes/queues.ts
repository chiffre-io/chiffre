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
  before?: number
  after?: number
}

const lightenMessage = (message: ProjectMessage): MessageQueueResponse => {
  const { projectID, performance, ...rest } = message
  return rest
}

export default async (app: App) => {
  app.get<QueryParams, UrlParams>(
    '/queues/:projectID',
    {
      preValidation: [app.authenticate()]
    },
    async (req, res) => {
      const { projectID } = req.params
      // todo: Make sure we have the right access
      const messages = await findMessagesForProject(
        app.db,
        projectID,
        req.query.before ? new Date(req.query.before) : undefined,
        req.query.after ? new Date(req.query.after) : undefined
      )
      return res.send(messages.map(lightenMessage))
    }
  )
}
