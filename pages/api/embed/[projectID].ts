import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import database, { Db } from '~/src/server/middleware/database'
import { Request } from '~/src/server/types'
import { findProject } from '~/src/server/db/models/projects/Projects'
import serverRuntimeConfig from '~/src/server/env'

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

export interface PushConfigResponse {
  publicKey: string
}

handler.get(async (req: Request<Db>, res: NextApiResponse) => {
  const projectID = getProjectID(req)
  const project = await findProject(req.db, projectID)
  if (!project) {
    return res.status(404).json({
      error: 'Project not found',
      details: `Project ID: ${projectID}`
    })
  }

  const emitterScriptUrl = '/emitter.js'
  res.setHeader('content-type', 'application/javascript')
  return res.send(`window.Chiffre = {
  config: {
    publicKey: "${project.publicKey}",
    projectID: "${project.id}",
    pushURL: "${serverRuntimeConfig.APP_URL}/api/push/${project.id}"
  }
}
window.addEventListener(
  'load',
  function() {
    var script = document.createElement('script')
    script.async = true
    script.src = '${emitterScriptUrl}'
    document.body.appendChild(script)
  },
  false
)`)
})

// todo: Factor better error handlers & logging story
handler.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

export default handler
