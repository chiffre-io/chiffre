import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import Next from 'next'
import type { NextServer } from 'next/dist/server/next'

declare module 'fastify' {
  interface FastifyInstance {
    next: NextServer
  }
}

const nextJsPlugin: FastifyPluginAsync<any> = async app => {
  const runningInProduction = process.env.NODE_ENV === 'production'
  const nextApp = Next({ dev: !runningInProduction })
  const nextRequestHandler = nextApp.getRequestHandler()
  await nextApp.prepare()
  app.decorate('next', nextApp)
  if (!runningInProduction) {
    app.get(
      '/_next/*',
      {
        logLevel: 'warn'
      },
      (req, res) => {
        return nextRequestHandler(req.raw, res.raw).then(() => {
          res.sent = true
        })
      }
    )
  }

  app.all(
    '/*',
    {
      logLevel: runningInProduction ? 'info' : 'warn'
    },
    (req, res) => {
      return nextRequestHandler(req.raw, res.raw).then(() => {
        res.sent = true
      })
    }
  )

  app.setNotFoundHandler((req, res) => {
    // todo: Check if coming from:
    // - a browser -> Render Next's 404 page
    // - an API -> Return a 404 with JSON
    req.log.info({ headers: req.headers })
    return nextApp.render404(req.raw, res.raw).then(() => {
      res.sent = true
    })
  })
}

export default fp(nextJsPlugin, {
  fastify: '3.x',
  name: 'NextJS'
})
