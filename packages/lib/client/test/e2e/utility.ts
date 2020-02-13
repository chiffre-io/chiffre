import fs from 'fs'
import dotenv from 'dotenv'
import checkEnv from '@47ng/check-env'
import createServer, { startServer } from '@chiffre/api/dist/server'
import { App } from '@chiffre/api/dist/types'
import path from 'path'
import Client from '../../src/index'

export interface TestContext {
  server: App
  client: Client
}

export async function setup(): Promise<TestContext> {
  const envFilePath = path.resolve(__dirname, 'e2e.env')
  dotenv.config({
    path: envFilePath
  })
  const envConfig = dotenv.parse(fs.readFileSync(envFilePath))
  for (const k in envConfig) {
    process.env[k] = envConfig[k]
  }

  checkEnv({ required: ['API_URL'] })
  console.dir({
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    API_URL: process.env.API_URL,
    CDN_URL: process.env.CDN_URL
  })

  const port = parseInt(process.env.PORT || '4000')
  const server = createServer()
  await startServer(server, port)
  const client = new Client({
    apiURL: process.env.API_URL!
  })
  try {
    await server.db.migrate.rollback(undefined, true)
    await server.db.migrate.latest()
  } catch (e) {
    console.error(e)
  }
  return { server, client }
}
