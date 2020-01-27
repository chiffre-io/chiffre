import dotenv from 'dotenv'
import envAlias from 'env-alias'
import createServer from './index'
import { startServer } from 'fastify-micro'

// -----------------------------------------------------------------------------

if (require.main === module) {
  // Setup environment
  dotenv.config()
  envAlias()

  const port = parseInt(process.env.PORT) || 3000
  const server = createServer()
  startServer(server, port)
}
