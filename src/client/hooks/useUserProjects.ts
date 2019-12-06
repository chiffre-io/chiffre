import React from 'react'
import { useSet } from 'react-use'
import { clientApi } from '~/src/client/api'
import { Project } from '~/src/server/db/models/entities/Projects'
import { CloakKey, decryptString } from '~/src/client/engine/crypto/cloak'
import { ProjectsList } from '~/pages/api/projects'

export default function useUserProjects(keychainKey: CloakKey) {
  const [projects, { add }] = useSet<Project>()
  React.useEffect(() => {
    if (!keychainKey) {
      return
    }
    clientApi.get<ProjectsList>('/projects').then(projects => {
      projects.forEach(async project => {
        const vaultKey = await decryptString(project.vaultKey, keychainKey)
        add({
          ...project,
          secretKey: await decryptString(project.secretKey, vaultKey)
        })
      })
    })
  }, [keychainKey])

  return Array.from(projects)
}
