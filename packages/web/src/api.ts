import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'

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
export const _api = axios.create({
  baseURL: '/api'
})

_api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error ?? error
    const e = new ApiError(message, error.request, error.response)
    return Promise.reject(e)
  }
)

// Add body/response typing
export default {
  raw: _api,
  get: async <R>(path: string): Promise<R> => await _api.get(path),
  post: async <B, R>(path: string, body: B): Promise<R> =>
    await _api.post(path, body),
  patch: async <B, R>(path: string, body: B): Promise<R> =>
    await _api.patch(path, body),
  delete: async <R>(path: string): Promise<R> => await _api.delete(path)
}
