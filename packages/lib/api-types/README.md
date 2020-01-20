# Chiffre API Types

Only the TypeScript types are published on NPM for the Chiffre API, as the
app code has no reason to be published this way, but the API client needs the
type definitions for its own publication.

Types are extracted from @chiffre/api at build time and stored in api-types.
Having a separate package for type defs also helps with dependency management,
as the types don't need much compared to all the app deps that are unnecessary
to pull for the client.
