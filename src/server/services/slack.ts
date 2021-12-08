import type { User } from '@prisma/client'
import {
  IncomingWebhook,
  IncomingWebhookDefaultArguments
} from '@slack/webhook'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { FastifyLoggerInstance } from 'fastify'
import seo from 'modules/seo.json'
import { Blocks, Md, Message, MessageBuilder } from 'slack-block-builder'

dayjs.extend(relativeTime)

// --

type Plan = any // todo: Move plans to Prisma

export interface CreateSlackMessageArgs {
  user: User
  plan?: Plan | null
  emoji?: string
  title: string
  notification?: string
  body?: Array<string | null>
  context?: Array<string | null>
}

export function createSlackMessage({
  user,
  plan,
  title,
  emoji,
  notification,
  body = [],
  context = []
}: CreateSlackMessageArgs) {
  const formatContextEmoji = (emoji: string, label: string) => {
    return [Md.emoji(emoji), label].join('  ')
  }
  const formatContextTitle = (title: string, label: string) => {
    return [Md.bold(title), label].join(' ')
  }

  const ctx = context.filter(Boolean) as string[]
  const slackMessage = Message({
    text: [seo.title, emoji, notification ?? title].filter(Boolean).join(' ')
  }).blocks(
    Blocks.Section({
      text: [emoji ? `${emoji}  ${title}\n` : `${title}\n`, ...body]
        .filter(Boolean)
        .join('\n')
    }),
    // .accessory(
    //   Elements.Img({
    //     imageUrl: user.image ?? undefined,
    //     altText: user.handle ?? user.name ?? 'No alt text available'
    //   })
    // ),
    ctx.length > 0 ? Blocks.Context().elements(ctx) : [],
    plan
      ? [
          // Plan info
          Blocks.Context().elements(
            formatContextEmoji('credit_card', plan.productName),
            formatContextEmoji('repeat', plan.recurringInterval),
            formatContextEmoji('traffic_light', plan.status)
          ),
          // Stripe links
          Blocks.Context().elements(
            formatContextTitle(
              'customer',
              stripeLink('customers', plan.customerID)
            ),
            formatContextTitle(
              'subscription',
              stripeLink('subscriptions', plan.subscriptionID)
            ),
            formatContextTitle('price', stripeLink('prices', plan.priceID))
          )
        ]
      : [
          Blocks.Context().elements(
            formatContextEmoji('money_with_wings', 'Free tier')
          )
        ]
  )
  return slackMessage
}

// --

export async function sendSlackMessage(
  logger: FastifyLoggerInstance,
  message: MessageBuilder,
  options: IncomingWebhookDefaultArguments = {}
) {
  const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL!, {
    username: `${seo.title} Events`,
    icon_emoji: Md.emoji('loudspeaker'),
    channel: process.env.SLACK_CHANNEL_EVENTS,
    ...options
  })
  logger.debug({
    msg: 'Sending Slack message',
    previewUrl: message.getPreviewUrl()
  })
  await webhook.send(message.buildToObject() as any)
}

// --

export function formatUser(user: User) {
  return [
    Md.bold(user.displayName ?? 'Anonymous'),
    Md.mailto(user.username, user.username)
  ].join(' • ')
}

export function stripeLink(objectType: string, objectID: string | null) {
  if (!objectID) {
    return `N.A.`
  }
  const scope = process.env.NODE_ENV === 'development' ? 'test/' : ''
  return Md.link(
    `https://dashboard.stripe.com/${scope}${objectType}/${objectID}`,
    Md.codeInline(objectID)
  )
}
