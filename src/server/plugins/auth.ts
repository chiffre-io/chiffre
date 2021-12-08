import type { User } from '@prisma/client'
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import type { TwoFactorStatus } from 'modules/auth/defs'

declare module 'fastify' {
  interface FastifyRequest {
    auth?: RequestAuthentication
  }
}

export interface RequestAuthentication {
  userID: User['id']
  twoFactorStatus: TwoFactorStatus
  tokenID: string
  plan: any
}

const authPlugin: FastifyPluginAsync = async app => {
  // todo: Implement me.
}

// --

export default fp(authPlugin, {
  fastify: '3.x',
  name: 'auth'
})
