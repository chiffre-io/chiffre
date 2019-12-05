import Knex from 'knex'
import {
  getAllExpiredLoginChallenges,
  deleteLoginChallenge
} from '~/src/server/db/models/auth/LoginChallengesSRP'
import { format as timeago } from 'timeago.js'

export default async function cleanupSrpChallenges(db: Knex) {
  const expired = await getAllExpiredLoginChallenges(db)
  if (expired.length === 0) {
    return // All good
  }

  const report = [{ userID: 'User ID', expiredAt: 'Expired at' }]
    .concat(
      expired.map(({ userID, expiresAt }) => {
        return {
          userID,
          expiredAt: `${expiresAt.toISOString()} (${timeago(expiresAt)})`
        }
      })
    )
    .map(({ userID, expiredAt }) => [userID.padEnd(36), expiredAt].join('  '))
    .join('\n')

  console.info(`Deleting ${expired.length} expired challenge(s):`)
  console.info(report)

  for (const { id } of expired) {
    try {
      await deleteLoginChallenge(db, id)
    } catch (error) {
      console.error('Failed to delete expired challenge', id)
    }
  }
}
