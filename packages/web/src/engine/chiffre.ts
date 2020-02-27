import ChiffreClient from '@chiffre/client'
import { AllEvents } from '@chiffre/analytics-core'
import { saveEvent } from './db'

export type LocalEvent = AllEvents & {
  id: string
  country?: string
}

export async function retrieveProjectMessages(
  client: ChiffreClient,
  projectID: string,
  before?: number,
  after?: number
) {
  const messages = await client.getProjectMessages(projectID, before, after)
  if (messages.length === 0) {
    return
  }
  const project = client.getProject(projectID)
  if (!project) {
    return
  }
  const errors = []
  for (const message of messages) {
    try {
      const json = project.decryptMessage(message.message)
      const event: AllEvents = JSON.parse(json)
      const localEvent: LocalEvent = {
        ...event,
        id: message.id,
        country: message.country
      }
      console.dir(localEvent)
      await saveEvent(localEvent)
    } catch (error) {
      errors.push(error)
    }
  }
  if (errors.length) {
    console.error(errors)
  }
}
