import database from '../database'
import { rotateUsersAuthSrpCloak } from '../models/auth/UsersAuthSRP'

const run = async () => {
  const usersAuthSrpResults = await rotateUsersAuthSrpCloak(database)
  console.dir(usersAuthSrpResults)
  process.exit(0)
}

if (require.main === module) {
  run()
}
