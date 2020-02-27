import Dexie from 'dexie'
import { AllEvents } from '@chiffre/analytics-core'

export class Database extends Dexie {
  events: Dexie.Table<AllEvents, number>

  constructor() {
    super('chiffre')
    this.version(1).stores({
      events: '++id,type'
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

export function saveEvent<E extends AllEvents>(event: E) {
  return db.events.add(event)
}
