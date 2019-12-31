import { NextPageContext } from 'next'
import Router from 'next/router'
import nextCookie from 'next-cookies'
import { isSessionValid } from '~/src/server/db/models/auth/Sessions'
import { getLoginCredentials } from '~/src/client/auth'
import { CookieNames } from '~/src/server/cookies'

export interface AuthClaims {
  userID: string
  sessionID: string
  sessionExpiresAt: Date
}

const redirectToLogin = async (ctx: NextPageContext) => {
  if (ctx.req) {
    // Server-side
    ctx.res.writeHead(302, { Location: `/login?redirect=${ctx.asPath}` })
    await new Promise(resolve => {
      ctx.res.end(resolve)
    })
  } else {
    // Client-side
    const redirectUrl = ctx ? ctx.asPath : window.location.pathname
    await Router.push(`/login?redirect=${redirectUrl}`)
  }
}

// --

export interface AuthenticatedPageProps {
  auth: AuthClaims
}

/**
 * Require authentication or redirect to /login
 * @param ctx Next.js page context
 */
export const authenticatePage = async (
  ctx: NextPageContext
): Promise<AuthClaims> => {
  try {
    if (ctx.req) {
      // Imported here to avoid client-side imports
      const database = require('~/src/server/db/database').default

      // Server-side: get the SessionID from the cookies
      const { [CookieNames.sid]: sid } = nextCookie(ctx)
      const session = await isSessionValid(database, sid)
      if (!session) {
        throw new Error('Session has expired')
      }
      return {
        userID: session.userID,
        sessionID: session.id,
        sessionExpiresAt: session.expiresAt
      }
    } else {
      // Client-side: get the auth claims from localStorage
      const auth = getLoginCredentials()
      if (!auth) {
        throw new Error('Not logged in')
      }
      return auth
    }
  } catch (error) {
    console.error('Authentication error:', error)
    await redirectToLogin(ctx)
    return null
  }
}
