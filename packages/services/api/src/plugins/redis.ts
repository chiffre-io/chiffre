import fp from 'fastify-plugin'
import Redis from 'ioredis'

export type RedisInstances = {
  rateLimiting: Redis.Redis
  srpChallenges: Redis.Redis
  tokenBlacklist: Redis.Redis
  ingressData: Redis.Redis
  ingressDataSub: Redis.Redis
}

export default fp((app, _, next) => {
  const uri = process.env.REDIS_URI
  const instances: RedisInstances = {
    rateLimiting: new Redis(uri, { db: 0 }),
    srpChallenges: new Redis(uri, { db: 1 }),
    tokenBlacklist: new Redis(uri, { db: 2 }),
    ingressData: new Redis(uri, { db: 3 }),
    ingressDataSub: new Redis(uri, { db: 3 })
  }
  app.decorate('redis', instances)
  next()
})

export function checkRedisHealth(instance: Redis.Redis, name: string) {
  const whitelist = ['connect', 'ready', 'connecting', 'reconnecting']
  if (!whitelist.includes(instance.status)) {
    throw new Error(`Redis status (${name}): ${instance.status}`)
  }
}
