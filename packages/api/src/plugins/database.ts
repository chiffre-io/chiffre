import fp from 'fastify-plugin'
import connectToDatabase from '../db/database'

export default fp((app, _, next) => {
  app.decorate('db', connectToDatabase())
  next()
})
