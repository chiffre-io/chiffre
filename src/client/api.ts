import axios, { Method, AxiosInstance, AxiosResponse } from 'axios'
import { getLoginCredentials } from './auth'

/**
 * API for public calls (no auth required: signup, login etc...)
 */
export const _publicApi = axios.create({
  baseURL: '/api'
})

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

// --

const wrapBodylessRequest = (client: AxiosInstance, method: Method) => async <
  Res
>(
  path: string
): Promise<Res> => {
  try {
    const res: AxiosResponse<Res> = await client(path, { method })
    return res.data
  } catch (error) {
    if (error.response) {
      // todo: Inject details if present
      throw new Error(error.response.data.error)
    }
    if (error.request) {
      // todo: handle Timeouts ?
    }
    throw new Error(error.message)
  }
}

const wrapBodyfulRequest = (client: AxiosInstance, method: Method) => async <
  Body,
  Res
>(
  path: string,
  body: Body
): Promise<Res> => {
  try {
    const res: AxiosResponse<Res> = await client(path, { method, data: body })
    return res.data
  } catch (error) {
    if (error.response) {
      // todo: Inject details if present
      throw new Error(error.response.data.error)
    }
    if (error.request) {
      // todo: handle Timeouts ?
    }
    throw new Error(error.message)
  }
}

// --

export const publicApi = {
  raw: _publicApi,
  post: wrapBodyfulRequest(_publicApi, 'POST')
}

export const clientApi = {
  raw: _clientApi,
  get: wrapBodylessRequest(_clientApi, 'GET'),
  post: wrapBodyfulRequest(_clientApi, 'POST'),
  patch: wrapBodyfulRequest(_clientApi, 'PATCH'),
  delete: wrapBodylessRequest(_clientApi, 'DELETE')
  // Uncomment when needed
  // head: wrapBodylessRequest(_clientApi, 'HEAD'),
  // options: wrapBodylessRequest(_clientApi, 'OPTIONS'),
  // put: wrapBodyfulRequest(_clientApi, 'PUT'),
}
