import { GenericDataPoint } from '@chiffre/analytics-core'

export interface Config {
  publicKey: Uint8Array
  pushURL: string
}

declare global {
  interface Window {
    chiffre: {
      // Generic events
      sendNumber: (data: GenericDataPoint<number>) => void
      sendNumbers: (data: GenericDataPoint<number>[]) => void
      sendString: (data: GenericDataPoint<string>) => void
    }
  }
}
