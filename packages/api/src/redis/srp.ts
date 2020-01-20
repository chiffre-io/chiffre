import { Redis } from 'ioredis'
import nanoid from 'nanoid'

function getSrpChallengeKey(userID: string, challengeID: string) {
  return `${userID}.${challengeID}`
}

export interface SaveSrpChallengeReturn {
  challengeID: string
}

export async function saveSrpChallenge(
  redis: Redis,
  userID: string,
  srpEphemeral: string
) {
  const challengeID = nanoid()
  await redis.setex(
    getSrpChallengeKey(userID, challengeID),
    5 * 60, // SRP challenges auto-expire after 5 minutes
    srpEphemeral
  )
  return challengeID
}

// --

export async function findSrpChallenge(
  redis: Redis,
  userID: string,
  challengeID: string
): Promise<string | null> {
  const key = getSrpChallengeKey(userID, challengeID)
  return await redis.get(key)
}

// --

export async function cleanupSrpChallenge(
  redis: Redis,
  userID: string,
  challengeID: string
) {
  const key = getSrpChallengeKey(userID, challengeID)
  const res = await redis.del(key)
  return res === 1
}
