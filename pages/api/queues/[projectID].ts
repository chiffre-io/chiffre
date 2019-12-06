import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import { Request } from '~/src/server/types'
import {
  findMessagesForProject,
  ProjectMessage
} from '~/src/server/db/models/entities/ProjectMessageQueue'
import extractUrlParameter, {
  UrlParams
} from '~/src/server/middleware/extractUrlParameter'

// --

export type MessageQueueResponse = Omit<
  ProjectMessage,
  'projectID' | 'performance'
>

const handler = nextConnect()

interface UrlParameters {
  projectID: string
}

handler.use(database)
handler.use(apiAuthMiddleware)
handler.use(extractUrlParameter<UrlParams<UrlParameters>>('projectID'))

const lightenMessage = (message: ProjectMessage): MessageQueueResponse => {
  const { projectID, performance, ...rest } = message
  return rest
}

handler.get(
  async (
    req: Request<Db & ApiAuth & UrlParams<UrlParameters>>,
    res: NextApiResponse
  ) => {
    const { projectID } = req.params
    // todo: Make sure we have the right access
    const messages = await findMessagesForProject(req.db, projectID)
    return res.json(messages.map(lightenMessage))
  }
)

export default handler
