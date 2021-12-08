import type { FastifyInstance } from 'fastify'
// import 'fastify-micro' // For declaration merging

// declare module 'fastify' {
//   interface FastifyInstance {
//     // routes: Route[]
//   }
// }

// export interface Route {
//   path: string
//   method: string
//   auth: boolean
// }

export type App = FastifyInstance

// export type Request = FastifyRequest & Partial<AuthenticatedRequest>
