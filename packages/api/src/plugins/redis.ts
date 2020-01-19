import fp from 'fastify-plugin'
import redis from 'redis'

export default fp((app, _, next) => {
  app.decorate('redis', redis.createClient(process.env.REDIS_URI))
  next()
})
