import path from 'path'
import dotenv from 'dotenv'
import envAlias from 'env-alias'
import createServer from '../server'
import { App } from '../types'

export type TaskRunner = (app: App) => Promise<void>

export default async function main(run: TaskRunner) {
  // Setup environment

  dotenv.config({
    path: path.resolve(
      process.cwd(),
      process.env.ENV_PRODUCTION === 'true' ? '.env.production' : '.env'
    )
  })
  envAlias()
  const app = createServer()
  await app.ready()
  app.log.info({
    msg: 'Task starting',
    task: run.name
  })
  try {
    await run(app)
  } catch (error) {
    app.log.error({
      msg: 'Error processing task',
      task: run.name,
      err: error
    })
    app.sentry.report(error)
  } finally {
    app.close()
  }
}
