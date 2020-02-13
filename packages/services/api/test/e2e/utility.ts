import fs from 'fs'
import dotenv from 'dotenv'
import axios, { AxiosInstance } from 'axios'
import createServer, { startServer } from '../../src/server'
import { App } from '../../src/types'
import path from 'path'

export interface TestContext {
  server: App
  api: AxiosInstance
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

  console.dir({
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    API_URL: process.env.API_URL,
    CDN_URL: process.env.CDN_URL
  })

  const port = parseInt(process.env.PORT) || 4000
  const server = createServer()
  await startServer(server, port)
  const api = axios.create({
    baseURL: process.env.API_URL,
    validateStatus: () => true
  })
  try {
    await server.db.migrate.rollback(undefined, true)
    await server.db.migrate.latest()
  } catch (e) {
    console.error(e)
  }
  return { server, api }
}
