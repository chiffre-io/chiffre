import fp from 'fastify-plugin'
import { App } from '../types'
import connectToDatabase from '../db/database'
import { Logger } from 'pino'

export default fp((app: App, _, next) => {
  app.decorate('db', connectToDatabase(app.log as Logger))
  next()
})
