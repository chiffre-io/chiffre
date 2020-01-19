import React from 'react'
import Client from '@chiffre/client'
import { ClientOptions, TwoFactorSettings } from '@chiffre/client'

interface ContextState {
  client: Client
}

const stubClient = {
  identity: null,
  settings: {
    twoFactor: ({
      enable: () => Promise.reject('The Chiffre client is not ready'),
      disable: () => Promise.reject('The Chiffre client is not ready'),
      cancel: () => Promise.reject('The Chiffre client is not ready'),
      verify: () => Promise.reject('The Chiffre client is not ready'),
      status: null
    } as unknown) as TwoFactorSettings
  },
  projects: []
}

let client: Client = null

const ClientContext = React.createContext<ContextState>({
  client: stubClient as Client
})

export const ChiffreClientProvider: React.FC<ClientOptions> = ({
  children,
  ...options
}) => {
  const [counter, setCounter] = React.useState(0)

  const onLocked = React.useCallback(() => {
    if (options.onLocked) {
      options.onLocked()
    }
    setCounter(c => c + 1)
  }, [])
  const onUpdate = React.useCallback(() => {
    if (options.onUpdate) {
      options.onUpdate()
    }
    setCounter(c => c + 1)
  }, [])

  React.useEffect(() => {
    if (client !== null) {
      return
    }
    import(/* webpackChunkName: "chiffre-client" */ '@chiffre/client').then(
      module => {
        console.info('Building the Chiffre client')
        client = new module.default({
          ...options,
          onLocked,
          onUpdate
        })
        onUpdate()
      }
    )
  }, [])

  const state = React.useMemo<ContextState>(
    () => ({
      client: client === null ? (stubClient as Client) : client
    }),
    [client, counter]
  )
  return (
    <ClientContext.Provider value={state}>{children}</ClientContext.Provider>
  )
}

export function useChiffreClient() {
  return React.useContext(ClientContext).client
}

export function useProject(projectID: string) {
  const client = useChiffreClient()
  return client.getProject(projectID)
}
