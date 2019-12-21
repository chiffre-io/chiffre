import database from '../database'
import { rotateUsersCloak } from '../models/auth/Users'

const run = async () => {
  const usersResults = await rotateUsersCloak(database)
  console.dir(usersResults)
  process.exit(0)
}

if (require.main === module) {
  run()
}
