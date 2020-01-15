import { App } from '../types'
import { createVault, findVault } from '../db/models/entities/Vaults'
import { AuthenticatedRequest } from '../plugins/auth'
import {
  CreateVaultParameters,
  createVaultParametersSchema,
  CreateVaultResponse,
  createVaultResponseSchema,
  FindVaultUrlParams,
  findVaultUrlParamsSchema,
  FindVaultResponse,
  findVaultResponseSchema
} from './vaults.schema'
import {
  findUserVaultEdge,
  createUserVaultEdge
} from '../db/models/entities/UserVaultEdges'

// --

type CreateVaultRequest = AuthenticatedRequest<
  any,
  any,
  any,
  any,
  CreateVaultParameters
>
type FindVaultRequest = AuthenticatedRequest<any, any, FindVaultUrlParams>

export default async (app: App) => {
  app.post(
    '/vaults',
    {
      preValidation: [app.authenticate()],
      schema: {
        summary: 'Create a new vault',
        body: createVaultParametersSchema,
        response: {
          201: createVaultResponseSchema
        }
      }
    },
    async (req: CreateVaultRequest, res) => {
      const { id: vaultID } = await createVault(app.db, req.auth.userID)
      await createUserVaultEdge(app.db, req.auth.userID, vaultID, req.body.key)
      const response: CreateVaultResponse = {
        vaultID
      }
      return res.status(201).send(response)
    }
  )
  app.get(
    '/vaults/:vaultID',
    {
      preValidation: [app.authenticate()],
      schema: {
        summary: 'Find a vault by ID',
        params: findVaultUrlParamsSchema,
        response: {
          200: findVaultResponseSchema
        }
      }
    },
    async (req: FindVaultRequest, res) => {
      const edge = await findUserVaultEdge(
        app.db,
        req.auth.userID,
        req.params.vaultID
      )
      if (!edge) {
        throw app.httpErrors.notFound('Vault not found')
      }
      const vault = await findVault(app.db, req.params.vaultID)
      if (!vault) {
        throw app.httpErrors.notFound('Vault not found')
      }
      const body: FindVaultResponse = {
        key: edge.vaultKey,
        createdBy: vault.createdBy,
        vaultID: vault.id
      }
      return res.send(body)
    }
  )
}
