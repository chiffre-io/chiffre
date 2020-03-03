import React from 'react'
import ChiffreClient from '@chiffre/client'
import { AllEvents } from '@chiffre/analytics-core'
import { Database, saveEvent, useDatabase } from './db'
import { useChiffreClient } from '../hooks/useChiffreClient'
import dayjs from 'dayjs'

export type LocalEvent = AllEvents & {
  id: string
  country?: string
}

export default function useLoadProjectMessages(projectID: string) {
  const client = useChiffreClient()
  const db = useDatabase()

  React.useEffect(() => {
    retrieveProjectMessages(client, db, projectID)
  }, [projectID, client.getProjectMessages])
}

export async function retrieveProjectMessages(
  client: ChiffreClient,
  db: Database,
  projectID: string
) {
  const before = dayjs()
    .subtract(5, 'minute')
    .valueOf()
  const afterRow = await db.events
    .where('projectID')
    .equals(projectID)
    .last()
  const after = afterRow
    ? dayjs(afterRow.time)
        .subtract(1, 'hour')
        .valueOf()
    : undefined

  const messages = await client.getProjectMessages(projectID, before, after)
  if (messages.length === 0) {
    return
  }
  const project = client.getProject(projectID)
  if (!project) {
    return
  }
  const errors = []
  console.groupCollapsed(
    `Messages for ${projectID} (before: ${before}, after: ${after})`
  )
  const events: LocalEvent[] = messages
    .map(msg => {
      try {
        const json = project.decryptMessage(msg.message)
        const event: AllEvents = JSON.parse(json)
        const localEvent: LocalEvent = {
          ...event,
          id: msg.id,
          country: msg.country
        }
        return localEvent
      } catch (error) {
        errors.push(`Error processing event: ${error}`)
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time)

  for (const event of events) {
    try {
      await saveEvent(db, projectID, event)
    } catch (error) {
      // todo: Silently handle collision cases, they are expected (overlap)
      errors.push(`Error saving event: ${error}`)
    }
  }
  console.groupEnd()
  if (errors.length) {
    console.groupCollapsed(
      `Errors for ${projectID} (before: ${before}, after: ${after})`
    )
    errors.forEach(e => console.error(e))
    console.groupEnd()
  }
}
