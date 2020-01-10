import dotenv from 'dotenv'
import envAlias from 'env-alias'
export * from './routes'
export * from './auth/types'

import { createServer, startServer } from './server'

if (require.main === module) {
  // Setup environment
  dotenv.config()
  envAlias()

  const port = parseInt(process.env.PORT) || 3000
  const server = createServer()
  startServer(server, port)
}
