import { User } from '@prisma/client'
import type { FastifyRequest } from 'fastify'
import type { App } from 'server/types'

export async function getUserForSentry(app: App, req: FastifyRequest) {
  let user: User | undefined
  if (req?.auth) {
    try {
      user =
        (await app.prisma.user.findUnique({
          where: {
            id: req.auth.userID
          }
        })) ?? undefined
    } catch {}
  }
  return {
    id: req?.auth?.userID || 'no auth provided',
    // todo: Add a way to avoid leaking user emails to Sentry
    username: user?.username || 'no auth provided'
  }
}

// --

export async function getExtrasForSentry(app: App, req?: FastifyRequest) {
  return {
    tags: {
      '2FA': req?.auth?.twoFactorStatus || 'no auth provided',
      plan: req?.auth?.plan || 'no auth provided'
    },
    context: {
      'token ID': req?.auth?.tokenID || 'no auth provided'
    }
  }
}
