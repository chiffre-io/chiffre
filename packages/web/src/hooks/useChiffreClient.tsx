export * from '@chiffre/client-react'

// import React from 'react'
// import Client from '@chiffre/client'
// import { ClientOptions } from '@chiffre/client'

// interface ContextState {
//   client: Client
//   lockCounter: number
// }

// const stubClient = {
//   identity: null,
//   projects: []
// }

// const ClientContext = React.createContext<ContextState>({
//   client: null,
//   lockCounter: 0
// })

// export const ChiffreClientProvider: React.FC<ClientOptions> = ({
//   children,
//   ...options
// }) => {
//   const [client, setClient] = React.useState<Client>(stubClient as Client)
//   const [lockCounter, setLockCounter] = React.useState(0)

//   const onLocked = React.useCallback(() => {
//     if (options.onLocked) {
//       options.onLocked()
//     }
//     setLockCounter(lockCounter + 1)
//   }, [])

//   React.useEffect(() => {
//     import('@chiffre/client').then(module =>
//       setClient(
//         new module.default({
//           ...options,
//           onLocked
//         })
//       )
//     )
//   }, [])

//   const state = React.useMemo<ContextState>(() => ({ client, lockCounter }), [
//     client,
//     lockCounter
//   ])

//   return (
//     <ClientContext.Provider value={state}>{children}</ClientContext.Provider>
//   )
// }

// export function useChiffreClient() {
//   return React.useContext(ClientContext).client
// }

// export function useProject(projectID: string) {
//   const client = useChiffreClient()
//   return client.getProject(projectID)
// }
