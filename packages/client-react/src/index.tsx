import React from 'react'
import Client, { ClientOptions } from '@chiffre/client'

interface ContextState {
  client: Client
  lockCounter: number
}

const ClientContext = React.createContext<ContextState>({
  client: null,
  lockCounter: 0
})

export const ChiffreClientProvider: React.FC<ClientOptions> = ({
  children,
  ...options
}) => {
  const [lockCounter, setLockCounter] = React.useState(0)

  const onLocked = React.useCallback(() => {
    if (options.onLocked) {
      options.onLocked()
    }
    setLockCounter(lockCounter + 1)
  }, [])

  const client = React.useMemo<Client>(
    () =>
      new Client({
        ...options,
        onLocked
      }),
    []
  )
  const state = React.useMemo<ContextState>(() => ({ client, lockCounter }), [
    client,
    lockCounter
  ])

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
