import { App } from '../types'

// --

export default async (app: App) => {
  app.get(
    '/_health',
    {
      logLevel: 'warn'
    },
    async (_req, res) => {
      return res.send({
        ok: true
      })
    }
  )
}
