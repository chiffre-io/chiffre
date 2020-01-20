import { Redis } from 'ioredis'
import { maxAgeInSeconds } from '../exports/defs'

export async function blacklistToken(
  redis: Redis,
  tokenID: string,
  userID: string,
  expiresInSeconds: number = maxAgeInSeconds.session
) {
  return await redis.setex(tokenID, Math.ceil(expiresInSeconds), userID)
}

export async function isTokenBlacklisted(
  redis: Redis,
  tokenID: string,
  userID: string
): Promise<boolean> {
  const res = await redis.get(tokenID)
  return res === userID
}
