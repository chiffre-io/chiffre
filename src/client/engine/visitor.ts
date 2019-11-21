import axios from 'axios'
import { encryptDataPoint } from './crypto'
import { b64 } from './crypto/primitives/codec'

export interface VisitorConfig {
  publicKey: Uint8Array
}

export const fetchConfig = async (): Promise<VisitorConfig> => {
  const res = await axios.get('/api/visitor/config')
  console.log('recievevd data', res.data)
  return {
    publicKey: res.data.publicKey && b64.decode(res.data.publicKey)
  }
}

export const pushDataPoint = async (data: any, config: VisitorConfig) => {
  if (!config) {
    return
  }
  const url = '/api/visitor/push'
  const message = encryptDataPoint(data, config.publicKey)
  if (!message) {
    console.error('Failed to encrypt data point', data, config)
    return
  }
  axios.post(url, message)
}
