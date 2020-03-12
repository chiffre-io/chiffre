import React from 'react'
import dayjs from 'dayjs'
import ChiffreClient from '@chiffre/client'
import { AllEvents } from '@chiffre/analytics-core'
import { MessageQueueResponse } from '@chiffre/api-types'
import { Database, EventRow, saveEvent, useDatabase } from './db'
import { useChiffreClient } from '../hooks/useChiffreClient'

export default function useLoadProjectMessages(projectID: string) {
  const client = useChiffreClient()
  const db = useDatabase()

  React.useEffect(() => {
    if (!projectID) {
      return
    }
    retrieveProjectMessages(client, db, projectID)
    const t = setInterval(
      () => retrieveProjectMessages(client, db, projectID),
      5000
    )
    return () => clearInterval(t)
  }, [projectID, client.getProjectMessages])
}

export async function retrieveProjectMessages(
  client: ChiffreClient,
  db: Database,
  projectID: string
) {
  const before = dayjs()
    .add(1, 'hour')
    .valueOf()
  let after = 0
  try {
    const afterRow = await db.events
      .where('projectID')
      .equals(projectID)
      .last()
    after = afterRow
      ? dayjs(afterRow.time)
          .subtract(1, 'hour')
          .valueOf()
      : after
  } catch (error) {
    console.error(error)
  }

  const project = client.getProject(projectID)
  if (!project) {
    return
  }

  let messages: MessageQueueResponse[] = []
  try {
    messages = await client.getProjectMessages(projectID, before, after)
  } catch (error) {
    console.error(error)
  }
  if (messages.length === 0) {
    return
  }
  const errors = []
  console.groupCollapsed(
    `Messages for ${projectID} (before: ${before}, after: ${after})`
  )
  const rows: EventRow[] = messages
    .map(msg => {
      try {
        const json = project.decryptMessage(msg.message)
        const event: AllEvents = JSON.parse(json)
        const row: EventRow = {
          ...event,
          id: msg.id,
          projectID,
          country: msg.country
        }
        return row
      } catch (error) {
        errors.push(`Error processing event: ${error}`)
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time)

  for (const row of rows) {
    try {
      await saveEvent(db, row)
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
