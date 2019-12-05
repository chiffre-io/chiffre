import Knex from 'knex'
import { hashString } from '~/src/client/engine/crypto/primitives/hash'
import { b64 } from '~/src/client/engine/crypto/primitives/codec'
import { Project, findProject } from '~/src/server/db/models/projects/Projects'

export const generateEmitterEmbedScriptContent = (project: Project) => {
  return `window.Chiffre = {
  config: {
    publicKey: "${project.publicKey}",
    projectID: "${project.id}",
    pushURL: "${process.env.APP_URL}/api/push/${project.id}"
  }
}
window.addEventListener(
  'load',
  function() {
    var script = document.createElement('script')
    script.async = true
    script.src = '${process.env.APP_URL}/emitter.js'
    document.body.appendChild(script)
  },
  false
)`
}

export const getEmitterEmbedScriptUrl = (projectID: string) => {
  return `${process.env.APP_URL}/api/embed/${projectID}`
}

export const calculateSubresourceIntegrityHash = async (
  db: Knex,
  projectID: string
) => {
  const project = await findProject(db, projectID)
  if (!project) {
    throw new Error('Project not found')
  }
  const contents = generateEmitterEmbedScriptContent(project)
  const hash = await hashString(contents, 'utf8', 'base64')
  return `sha256-${b64.urlUnsafe(hash)}`
}

export const formatEmitterEmbedScript = async (db: Knex, projectID: string) => {
  const url = getEmitterEmbedScriptUrl(projectID)
  const srih = await calculateSubresourceIntegrityHash(db, projectID)
  return `<script src="${url}" integrity="${srih}" crossorigin="anonymous" async=""></script>`
}
