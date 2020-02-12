import main, { TaskRunner } from './task'
import { rotateUsersCloak } from '../db/models/auth/Users'
import { RotationResults } from '../db/encryption'

const printResults = (name: string, results: RotationResults) => {
  if (results.processed.length) {
    console.info(`${name}: rotated ${results.processed.length} records`)
  }
  results.errors.map(e => {
    console.error(name, e)
  })
}

const run: TaskRunner = async function rotateCloak(app) {
  printResults('users', await rotateUsersCloak(app.db))
}

if (require.main === module) {
  main(run)
}
