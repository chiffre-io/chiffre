import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { getLoginCredentials } from './auth'

export class ApiError<R> extends Error {
  public req: AxiosRequestConfig
  public res: AxiosResponse<R>
  public title: string

  constructor(message: string, req: AxiosRequestConfig, res: AxiosResponse) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    this.name = 'API Error'
    this.req = req
    this.res = res
  }
}

/**
 * API for public calls (no auth required: signup, login etc...)
 */
export const _publicApi = axios.create({
  baseURL: '/api'
})

_publicApi.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error ?? error
    const e = new ApiError(message, error.request, error.response)
    return Promise.reject(e)
  }
)

/**
 * API for authenticated calls from the client side,
 * authenticated by the Authoriation: "Bearer {jwt}" header.
 */
const _clientApi = axios.create({
  baseURL: '/api'
})

// Inject credentials for every request
_clientApi.interceptors.request.use(config => {
  if (typeof window === 'undefined') {
    // Server-side request, not much we can do here..
    throw new Error('Attempt to use client-side library from server-side')
  }
  config.headers.authorization = `Bearer ${getLoginCredentials()}`
  return config
})

_clientApi.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error ?? error
    const e = new ApiError(message, error.request, error.response)
    return Promise.reject(e)
  }
)

// --

export const publicApi = {
  raw: _publicApi,
  get: async <R>(path: string): Promise<R> => await _publicApi.get(path),
  post: async <B, R>(path: string, body: B): Promise<R> =>
    await _publicApi.post(path, body)
}

export const clientApi = {
  raw: _clientApi,
  get: async <R>(path: string): Promise<R> => await _clientApi.get(path),
  post: async <B, R>(path: string, body: B): Promise<R> =>
    await _clientApi.post(path, body),
  patch: async <B, R>(path: string, body: B): Promise<R> =>
    await _clientApi.patch(path, body),
  delete: async <R>(path: string): Promise<R> => await _clientApi.delete(path)
}
