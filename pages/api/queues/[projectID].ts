import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import {
  apiAuthMiddleware,
  ApiAuth
} from '~/src/server/middleware/authMiddlewares'
import { Request } from '~/src/server/types'
import { findMessagesForProject } from '~/src/server/db/models/projects/ProjectMessageQueue'
import extractUrlParameter, {
  UrlParams
} from '~/src/server/middleware/extractUrlParameter'

// --

const handler = nextConnect()

interface UrlParameters {
  projectID: string
}

handler.use(database)
handler.use(apiAuthMiddleware)
handler.use(extractUrlParameter<UrlParams<UrlParameters>>('projectID'))

handler.get(
  async (
    req: Request<Db & ApiAuth & UrlParams<UrlParameters>>,
    res: NextApiResponse
  ) => {
    const { projectID } = req.params
    // todo: Make sure we have the right access
    const messages = await findMessagesForProject(req.db, projectID)
    return res.json(messages)
  }
)

export default handler
