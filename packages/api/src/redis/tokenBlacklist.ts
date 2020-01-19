import redis from 'redis'
import { maxAgeInSeconds } from '../exports/defs'

type Redis = redis.RedisClient

function getTokenBlacklistKey(tokenID: string) {
  return `token:blacklist:${tokenID}`
}

export async function blacklistToken(
  redis: Redis,
  tokenID: string,
  userID: string,
  expiresInSeconds: number = maxAgeInSeconds.session
) {
  const key = getTokenBlacklistKey(tokenID)
  return new Promise((resolve, reject) => {
    redis.setex(key, Math.ceil(expiresInSeconds), userID, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

export async function isTokenBlacklisted(
  redis: Redis,
  tokenID: string,
  userID: string
): Promise<boolean> {
  const key = getTokenBlacklistKey(tokenID)
  return new Promise((resolve, reject) => {
    redis.get(key, (err, result) => {
      if (err) return reject(err)
      resolve(result === userID)
    })
  })
}
