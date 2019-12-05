import { NextPageContext } from 'next'
import Router from 'next/router'
import nextCookie from 'next-cookies'
import { verifyJwt, JwtClaims, extractJwtClaims } from '~/src/server/jwt'
import { isSessionValid } from '~/src/server/db/models/auth/Sessions'
import { getLoginCredentials } from '~/src/client/auth'
import { CookieNames } from '~/src/server/cookies'

const redirectToLogin = async (ctx: NextPageContext) => {
  if (ctx.req) {
    // Server-side
    ctx.res.writeHead(302, { Location: `/login?redirect=${ctx.pathname}` })
    await new Promise(resolve => {
      ctx.res.end(resolve)
    })
  } else {
    // Client-side
    const redirectUrl = ctx ? ctx.pathname : window.location.pathname
    await Router.push(`/login?redirect=${redirectUrl}`)
  }
}

// --

/**
 * Require authentication or redirect to /login
 * @param ctx Next.js page context
 */
export const authenticatePage = async (
  ctx: NextPageContext
): Promise<JwtClaims> => {
  try {
    if (ctx.req) {
      // Imported here to avoid client-side imports
      const database = require('~/src/server/db/database').default

      // Server-side: get the JWT from the cookies
      const { [CookieNames.jwt]: jwt } = nextCookie(ctx)
      const claims = verifyJwt(jwt)
      const validSession = await isSessionValid(
        database,
        claims.sessionID,
        claims.userID
      )
      if (!validSession) {
        throw new Error('Session has expired')
      }
      return claims
    } else {
      // Client-side: get the JWT from localStorage
      const jwt = getLoginCredentials()
      if (!jwt) {
        throw new Error('Not logged in')
      }
      return extractJwtClaims(jwt)
    }
  } catch (error) {
    console.error('Authentication error:', error)
    await redirectToLogin(ctx)
    return null
  }
}
