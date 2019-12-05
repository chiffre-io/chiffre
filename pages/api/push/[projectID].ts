import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import { Request } from '~/src/server/types'
import { pushMessage } from '~/src/server/db/models/projects/ProjectMessageQueue'

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

const getPerformance = (req: Request<Db>) => {
  try {
    const match = req.headers['content-type'].match(/perf=(?<perf>\d+)$/)
    const { perf } = match.groups
    return parseInt(perf, 10)
  } catch (error) {
    console.error(error)
    return -1
  }
}

handler.post(async (req: Request<Db>, res: NextApiResponse) => {
  const projectID = getProjectID(req)
  try {
    const message = req.body
    const performance = getPerformance(req)
    pushMessage(req.db, projectID, message, performance)
    return res.status(204).send(null)
  } catch (error) {
    console.error(error)
    return res.status(204).send(null)
  }
})

export default handler
