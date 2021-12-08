// https://tools.ietf.org/html/rfc7807

import { STATUS_CODES } from 'node:http'
import { z } from 'zod'

export const rfc7807Schema = z.object({
  status: z
    .number()
    .int()
    .refine(code => code in STATUS_CODES),
  type: z.string().url().optional(), // Technically a URI, but let's not split hair
  title: z.string(),
  detail: z.string().optional(),
  instance: z.string().url().optional()
})

export type RFC7807 = z.TypeOf<typeof rfc7807Schema>

export class RFC7807Error extends Error {
  readonly rfc7807: RFC7807

  constructor(args: RFC7807) {
    super(
      `${STATUS_CODES[args.status]}: ${args.title}${
        args.detail ? ` (${args.detail})` : ''
      }`
    )
    this.name = 'RFC7807Error'
    this.rfc7807 = {
      ...args,
      type: args.type ?? 'about:blank'
    }
  }
}
