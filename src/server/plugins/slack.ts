import type { User } from '@prisma/client'
import type { FastifyLoggerInstance, FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { LoggerScopes, scopedLogger } from 'modules/logger/scopes'
import {
  createSlackMessage,
  formatUser,
  sendSlackMessage
} from 'server/services/slack'
import { App } from 'server/types'

declare module 'fastify' {
  interface FastifyInstance {
    slack: SlackDecoration
  }
}

export type SlackNotifier<Args> = (args: Args) => Promise<void>

export interface SlackDecoration {
  log: FastifyLoggerInstance
  notifyNewUserSignup: SlackNotifier<{ user: User }>
}

// --

const slackPlugin: FastifyPluginAsync = async app => {
  const log = scopedLogger(app.log, LoggerScopes.pluginSlack)
  const decoration: SlackDecoration = {
    log,
    notifyNewUserSignup: handleErrors(app, ({ user }) => {
      const message = createSlackMessage({
        user,
        title: `New user: ${formatUser(user)}`,
        notification: `New user: ${user.username}`,
        emoji: '👋'
      })
      return sendSlackMessage(log, message)
    })
  }
  app.decorate('slack', decoration)
}

// Helpers --

function handleErrors<Args>(
  app: App,
  notifier: SlackNotifier<Args>
): SlackNotifier<Args> {
  return args => {
    try {
      return notifier(args)
    } catch (error) {
      app.slack.log.error(error)
      app.sentry.report(error as any)
      return Promise.resolve()
    }
  }
}

// --

export default fp(slackPlugin, {
  fastify: '3.x',
  name: 'Slack'
})
