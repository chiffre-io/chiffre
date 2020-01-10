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

const lightenMessage = (message: ProjectMessage): MessageQueueResponse => {
  const { projectID, performance, ...rest } = message
  return rest
}

export default async (app: App) => {
  app.get<unknown, UrlParams>(
    '/queues/:projectID',
    {
      preValidation: [app.authenticate()]
    },
    async (req, res) => {
      const { projectID } = req.params
      // todo: Make sure we have the right access
      const messages = await findMessagesForProject(app.db, projectID)
      return res.send(messages.map(lightenMessage))
    }
  )
}
