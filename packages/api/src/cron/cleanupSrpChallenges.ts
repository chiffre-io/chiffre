import {
  getAllExpiredLoginChallenges,
  deleteLoginChallenge
} from '../db/models/auth/LoginChallengesSRP'
import { App } from '../types'

export default async function cleanupSrpChallenges(app: App) {
  const expired = await getAllExpiredLoginChallenges(app.db)
  if (expired.length === 0) {
    return // All good
  }

  app.log.info({ expired, msg: 'Deleting expired challenges' })

  for (const { id } of expired) {
    try {
      await deleteLoginChallenge(app.db, id)
    } catch (error) {
      app.log.error({
        challengeID: id,
        msg: 'Failed to delete expired challenge'
      })
    }
  }
}
