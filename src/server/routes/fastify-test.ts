import type { App } from 'server/types'

export default async (app: App) => {
  app.get('/test', async (req, res) => {
    const users = await app.prisma.user.findMany()
    req.log.info({ users })
    res.send({ users })
  })
}
