import dotenv from 'dotenv'
import envAlias from 'env-alias'
import { rotateUsersCloak } from '../models/auth/Users'
import { RotationResults } from '../encryption'
import connectToDatabase from '../database'
import pino from 'pino'

const printResults = (name: string, results: RotationResults) => {
  if (results.processed.length) {
    console.info(`${name}: rotated ${results.processed.length} records`)
  }
  results.errors.map(e => {
    console.error(name, e)
  })
}

const run = async () => {
  const logger = pino()
  const database = connectToDatabase(logger)
  printResults('users', await rotateUsersCloak(database))
  process.exit(0)
}

if (require.main === module) {
  // Setup environment
  dotenv.config()
  envAlias()
  run()
}
