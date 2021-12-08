import { GenericDataPoint } from 'modules/analytics/core'

export interface Config {
  publicKey: Uint8Array
  pushURL: string
  ignorePaths?: string[]
}

declare global {
  interface Window {
    chiffre: {
      // Generic events
      sendNumber: (data: GenericDataPoint<number>) => void
      sendNumbers: (data: GenericDataPoint<number>[]) => void
      sendString: (data: GenericDataPoint<string>) => void
      sendStrings: (data: GenericDataPoint<string>[]) => void
    }
  }
}
