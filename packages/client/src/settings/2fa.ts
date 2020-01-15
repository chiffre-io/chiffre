import type { AxiosInstance, AxiosResponse } from "axios";
import {
  TwoFactorStatus,
  AuthClaims,
  TwoFactorEnableResponse,
  TwoFactorVerifyResponse,
  TwoFactorVerifyParameters,
  TwoFactorDisableParameters
} from "@chiffre/api-types";

type GetAuthClaims = () => AuthClaims | undefined
type HandleAuth = (res: AxiosResponse) => void

export default class TwoFactorSettings {
  #api: AxiosInstance
  #handleAuth: HandleAuth
  #getAuthClaims: GetAuthClaims

  constructor(
    api: AxiosInstance,
    handleAuth: HandleAuth,
    getAuthClaims: GetAuthClaims
  ) {
    this.#api = api
    this.#handleAuth = handleAuth
    this.#getAuthClaims = getAuthClaims
  }

  public get status(): TwoFactorStatus {
    const claims = this.#getAuthClaims()
    return claims?.twoFactorStatus
  }

  public async enable(): Promise<TwoFactorEnableResponse> {
    const res = await this.#api.post('/auth/2fa/enable', {})
    this.#handleAuth(res)
    return res.data
  }

  public async cancel() {
    const res = await this.#api.delete('/auth/2fa/enable')
    this.#handleAuth(res)
  }

  public async verify(totpToken: string): Promise<TwoFactorVerifyResponse> {
    const params: TwoFactorVerifyParameters = {
      twoFactorToken: totpToken
    }
    const res = await this.#api.post('/auth/2fa/verify', params)
    this.#handleAuth(res)
    return res.data
  }

  public async disable(totpToken: string) {
    const params: TwoFactorDisableParameters = {
      twoFactorToken: totpToken
    }
    const res = await this.#api.post('/auth/2fa/disable', params)
    this.#handleAuth(res)
  }
}
