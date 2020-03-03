import Dexie from 'dexie'
import { AllEvents } from '@chiffre/analytics-core'

export type EventRow = AllEvents & {
  projectID: string
}

export class Database extends Dexie {
  events: Dexie.Table<EventRow, number>

  constructor() {
    super('chiffre')
    this.version(1).stores({
      events: '&id,projectID,type,time'
    })
    this.events = this.table('events') // Just informing Typescript what Dexie has already done...
  }
}

const db: Database = typeof window === 'undefined' ? null : new Database()

export function setupDatabase() {
  if (!db) {
    return
  }
  db.open().catch(err => {
    console.error(`Open failed: ${err.stack}`)
  })
}

export function saveEvent<E extends AllEvents>(
  db: Database,
  projectID: string,
  event: E
) {
  return db.events.add({
    projectID,
    ...event
  } as EventRow)
}

export function useDatabase() {
  return db
}
