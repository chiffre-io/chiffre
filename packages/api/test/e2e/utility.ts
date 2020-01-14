import { CronJob } from 'cron'
import dotenv from 'dotenv'
import axios, { AxiosInstance } from 'axios'
import { createServer, startServer } from '../../src/server'
import { App } from '../../src/types'
import path from 'path'

export interface TestContext {
  server: App
  api: AxiosInstance
  crons: CronJob[]
}

export async function setup(): Promise<TestContext> {
  dotenv.config({
    path: path.join(path.dirname(__filename), 'e2e.env')
  })

  const port = parseInt(process.env.PORT) || 4000
  const server = createServer()
  const crons = startServer(server, port)
  await server.ready()
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
  return { server, api, crons }
}
