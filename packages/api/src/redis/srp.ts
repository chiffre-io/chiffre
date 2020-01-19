import redis from 'redis'
import nanoid from 'nanoid'

type Redis = redis.RedisClient

function getSrpChallengeKey(userID: string, challengeID: string) {
  return `srp:challenge:${userID}.${challengeID}`
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
  return new Promise<SaveSrpChallengeReturn>((resolve, reject) => {
    redis.setex(
      getSrpChallengeKey(userID, challengeID),
      5 * 60, // SRP challenges auto-expire after 5 minutes
      srpEphemeral,
      err => {
        if (err) return reject(err)
        resolve({
          challengeID
        })
      }
    )
  })
}

// --

export async function findSrpChallenge(
  redis: Redis,
  userID: string,
  challengeID: string
): Promise<string | null> {
  const key = getSrpChallengeKey(userID, challengeID)
  return new Promise((resolve, reject) => {
    redis.get(key, (err, value) => {
      if (err) return reject(err)
      resolve(value)
    })
  })
}

// --

export async function cleanupSrpChallenge(
  redis: Redis,
  userID: string,
  challengeID: string
) {
  const key = getSrpChallengeKey(userID, challengeID)
  return new Promise<boolean>((resolve, reject) => {
    redis.del(key, (err, value) => {
      if (err) return reject(err)
      resolve(value === 1)
    })
  })
}
