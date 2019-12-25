import database from '../database'
import { rotateUsersCloak } from '../models/auth/Users'
import { rotateSessionsCloak } from '../models/auth/Sessions'
import { RotationResults } from '../encryption'

const printResults = (name: string, results: RotationResults) => {
  if (results.processed.length) {
    console.info(`${name}: rotated ${results.processed.length} records`)
  }
  results.errors.map(e => {
    console.error(name, e)
  })
}

const run = async () => {
  printResults('users', await rotateUsersCloak(database))
  printResults('sessions', await rotateSessionsCloak(database))
  process.exit(0)
}

if (require.main === module) {
  run()
}
