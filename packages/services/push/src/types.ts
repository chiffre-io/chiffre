export interface SerializedMessage {
  /**
   * Encrypted payload
   */
  msg: string

  /**
   * Timestamp of reception, for internal performance metrics
   */
  received: number

  /**
   * Time spent by the client for stringifying and encrypting the
   * event, for internal performance metrics
   */
  perf?: number

  /**
   * Country code of origin of the message
   */
  country?: string
}
