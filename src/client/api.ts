import axios from 'axios'
import { getLoginCredentials } from './auth'

/**
 * API for public calls (no auth required: signup, login etc...)
 */
export const publicApi = axios.create({
  baseURL: '/api'
})

/**
 * API for authenticated calls from the client side,
 * authenticated by the Authoriation: "Bearer {jwt}" header.
 */
export const clientApi = axios.create({
  baseURL: '/api'
})

// Inject credentials for every request
clientApi.interceptors.request.use(config => {
  if (typeof window === 'undefined') {
    // Server-side request, not much we can do here..
    throw new Error('Attempt to use client-side library from server-side')
  }
  config.headers.authorization = `Bearer ${getLoginCredentials()}`
  return config
})
