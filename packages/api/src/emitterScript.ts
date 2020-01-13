import { b64 } from '@47ng/codec'
import { hashString } from '@chiffre/crypto'
import { Project } from './db/models/entities/Projects'

export const generateEmitterEmbedScriptContent = (project: Project) => {
  return `
(function(){
  function load(resolve) {
    window.addEventListener(
      'load',
      function() {
        var script = document.createElement('script')
        script.async = true
        script.src = '${process.env.API_URL}/static/emitter.js'
        document.body.appendChild(script)
        script.onload = function() {
          resolve()
        }
      },
      false
    )
  }
  window.Chiffre = {
    config: {
      publicKey: "${project.publicKey}",
      projectID: "${project.id}",
      pushURL: "${process.env.API_URL}/v1/push/${project.id}"
    },
    ready: new Promise(function(resolve) {
      load(resolve)
    }),
    sendEvent: function(type, data = undefined) {}
  }
})()`
}

export const getEmitterEmbedScriptUrl = (projectID: string) => {
  return `${process.env.API_URL}/v1/embed/${projectID}`
}

export const calculateSubresourceIntegrityHash = async (project: Project) => {
  const contents = generateEmitterEmbedScriptContent(project)
  const hash = await hashString(contents, 'utf8', 'base64')
  return `sha256-${b64.urlUnsafe(hash)}`
}

export const formatEmitterEmbedScript = async (project: Project) => {
  const url = getEmitterEmbedScriptUrl(project.id)
  const srih = await calculateSubresourceIntegrityHash(project)
  return `<script src="${url}" integrity="${srih}" crossorigin="anonymous" async=""></script>`
}
