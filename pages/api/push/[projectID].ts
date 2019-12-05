import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import { Request } from '~/src/server/types'
import { findProject } from '~/src/server/db/models/projects/Projects'

// --

const handler = nextConnect()

handler.use(database)

const getProjectID = (req: Request<Db>): string => {
  const { projectID } = req.query
  if (!projectID) {
    return null
  }
  return typeof projectID === 'string' ? projectID : projectID[0]
}

handler.post(async (req: Request<Db>, res: NextApiResponse) => {
  const projectID = getProjectID(req)
  // todo: Push to message queue
  console.dir({
    projectID,
    message: req.body
  })
  return res.status(204).send(null)
})

export default handler
