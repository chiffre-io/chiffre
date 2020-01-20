import fp from 'fastify-plugin'
import Redis from 'ioredis'

export type RedisInstances = {
  rateLimiting: Redis.Redis
  srpChallenges: Redis.Redis
  tokenBlacklist: Redis.Redis
}

export default fp((app, _, next) => {
  const uri = process.env.REDIS_URI
  const instances: RedisInstances = {
    rateLimiting: new Redis(uri, { db: 0 }),
    srpChallenges: new Redis(uri, { db: 1 }),
    tokenBlacklist: new Redis(uri, { db: 2 })
  }
  app.decorate('redis', instances)
  next()
})
