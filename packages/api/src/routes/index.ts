import { App } from '../types'

const loadRoute = (app: App, path: string) => {
  try {
    app.register(require(path).default, {
      prefix: `/v1`
    })
  } catch (e) {
    console.error(e)
  }
}

export default async (app: App) => {
  app.register(require('./_health').default)

  // Auth routes
  loadRoute(app, './auth/signup')
  loadRoute(app, './auth/login/challenge')
  loadRoute(app, './auth/login/response')
  loadRoute(app, './auth/login/2fa')
  loadRoute(app, './auth/2fa/enable')
  loadRoute(app, './auth/2fa/verify')
  loadRoute(app, './auth/2fa/disable')

  // loadRoute(app, '/push/[projectID]')
  // loadRoute(app, '/queues/[projectID]')

  loadRoute(app, './keychain')
  loadRoute(app, './vaults')
  loadRoute(app, './projects')
  loadRoute(app, './embed')
}

// Forward API Interface types
export * from './auth/signup.schema'
export * from './auth/login/challenge.schema'
export * from './auth/login/response.schema'
export * from './auth/login/2fa.schema'
export * from './auth/2fa/enable.schema'
export * from './auth/2fa/verify.schema'
export * from './auth/2fa/disable.schema'
export * from './vaults.schema'
export * from './projects.schema'
export * from './queues.schema'
