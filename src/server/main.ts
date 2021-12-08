import dotenv from 'dotenv'
import envAlias from 'env-alias'
import { createServer, startServer } from './server'

export async function main() {
  process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error)
    process.exit(1)
  })
  process.on('unhandledRejection', error => {
    console.error('Unhandled rejection:', error)
    process.exit(1)
  })
  // Setup environment
  dotenv.config()
  envAlias()
  const appServer = createServer()
  await startServer(appServer)
  await new Promise(r => setTimeout(r, 3000))
  await appServer.close()
}

// --

if (require.main === module) {
  main()
}
