import { App } from '../types'
import { findProject } from '../db/models/entities/Projects'
import { generateEmitterEmbedScriptContent } from '../emitterScript'

// --

type UrlParams = {
  projectID: string
}

export default async (app: App) => {
  app.get<unknown, UrlParams>('/embed/:projectID', async (req, res) => {
    const { projectID } = req.params
    const project = await findProject(app.db, projectID)
    if (!project) {
      throw app.httpErrors.notFound('Project not found')
    }
    res.header('content-type', 'application/javascript')
    const content = generateEmitterEmbedScriptContent(project)
    return res.send(content)
  })
}
