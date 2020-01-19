import { App } from '../types'

function loadRoute(app: App, path: string) {
  try {
    app.register(require(path).default, {
      prefix: `/v1`
    })
  } catch (error) {
    app.log.fatal({ msg: 'Failed to load route', error })
    process.exit(1)
  }
}

export default async function loadRoutes(app: App) {
  loadRoute(app, './auth/signup')
  loadRoute(app, './auth/login/challenge')
  loadRoute(app, './auth/login/response')
  loadRoute(app, './auth/login/2fa')
  loadRoute(app, './auth/2fa/enable')
  loadRoute(app, './auth/2fa/verify')
  loadRoute(app, './auth/2fa/disable')
  loadRoute(app, './auth/logout')
  loadRoute(app, './keychain')
  loadRoute(app, './vaults')
  loadRoute(app, './projects')
  loadRoute(app, './embed')
  loadRoute(app, './users')
  loadRoute(app, './activity')
}

// Forward API Interface types
export * from './auth/signup.schema'
export * from './auth/login/challenge.schema'
export * from './auth/login/response.schema'
export * from './auth/login/2fa.schema'
export * from './auth/2fa/enable.schema'
export * from './auth/2fa/verify.schema'
export * from './auth/2fa/disable.schema'
export * from './keychain.schema'
export * from './vaults.schema'
export * from './projects.schema'
export * from './queues.schema'
export * from './users.schema'
export * from './activity.schema'
