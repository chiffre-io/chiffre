import axios from 'axios'
import type { App } from 'server/types'

async function postMetric(id: string, value: number) {
  return axios.post(
    `https://api.instatus.com/v1/cknukstxu390220dgoj0xl5rqfl/metrics/${id}`,
    {
      timestamp: Date.now(),
      value
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.INSTATUS_API_TOKEN}`
      }
    }
  )
}

export async function instatusMetrics(app: App) {
  if (!process.env.INSTATUS_API_TOKEN) {
    return
  }
  const [count, last24hCount] = await Promise.all([
    app.prisma.message.count(),
    app.prisma.message.count({
      where: {
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          lte: new Date()
        }
      }
    })
  ])
  await Promise.allSettled([
    postMetric('cknul0dau190045cuoh2p4uv5dj', count),
    postMetric('cknvdoa9z12655e4n0y9u0x864', last24hCount)
  ])
}
