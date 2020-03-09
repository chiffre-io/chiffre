import Dexie from 'dexie'
import { AllEvents } from '@chiffre/analytics-core'

export type EventRow = AllEvents & {
  id: string
  projectID: string
  country?: string
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

export function saveEvent(db: Database, row: EventRow) {
  return db.events.add(row)
}

export function useDatabase() {
  return db?.isOpen ? db : null
}
