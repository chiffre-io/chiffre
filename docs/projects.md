# Projects

## Create a project

Required information:

- Name
- Deployment URL
- Description (optional)

Database entities:

```ts
interface Project {
  id: string // primary key, UUID auto-generated
  publicKey: string // required
  encrypted: string // required

  // Clear-text data (encrypted in DB but readable by the platform)
  name?: string // optional

  // What happens when a user wants to delete their account
  // but they have shared the project ?
  creator: string // FK users.id

  // Timestamps
  created_at: Date
  updated_at: Date
}

// Many-to-Many
interface UserProjects {
  id: string // primary key, UUID auto-generated
  userID: string // FK users.id
  projectID: string // FK projects.id

  // Check out how to represent relationships
  // note: Can be added later with a migration
  invitedBy?: string // FK users.id, null for project creator
}
```

1. Create project keys locally (nacl.box.keyPair)
2. Create project data locally

```ts
const project = {
  v: 1,
  keys: {
    public: 'bNBr9tPRAoQTl/VLwJw6ZaSy93DFU9g71vLwLhSuges=',
    secret: 'Ti5CQCEeYmcyphI0b02O8ZFO1FsNOV8YL9ksilU0BG0=',
  },
  public: {
    // Anything here will be sent to the server in clear text
  },
  secret: {
    // Anything in here will be stored encrypted
    name: 'foo',
    description: 'bar',
    ...
  }
}
```

3. Create new Cloak key for the project (keep it in memory for now)
4. Encrypt project data using Cloak
5. Create project entity on server:

```
POST /api/projects
Authorization: Bearer {jwt}

{
  "publicKey": "bNBr9tPRAoQTl/VLwJw6ZaSy93DFU9g71vLwLhSuges=",
  "encrypted": "v1.aesgcm256.c1f4d53c.M140NBtrhcygD_x7.uDJEkpydqvOfc7vZ7j6OwqTGsvrpk0GLgKbSKkqK",
  "public": {
    ...whatever is under the `public` field
  }
}

Response:
{
  "projectID": "ac5b56a6-9939-4138-8ebc-15bff30f7f07"
}
```

6. Place Cloak key in vault keychain (under the returned project ID)
7. Update the vault on server

## Retrieve a project

We assume the user has unlocked their keychain and vault(s), and retrieved
some project IDs, and wants to retrieve the latest remote project state.

```
GET /api/projects/{projectID}
Authorization: Bearer {jwt}

Response:
{
  "id": "{projectID}",
  "publicKey: "bNBr9tPRAoQTl/VLwJw6ZaSy93DFU9g71vLwLhSuges=",
  "encrypted": "v1.aesgcm256.c1f4d53c.M140NBtrhcygD_x7.uDJEkpydqvOfc7vZ7j6OwqTGsvrpk0GLgKbSKkqK"
}
```

Locally, the client uses their keychain to de-Cloak the encrypted project,
and retrieves the project secret key and configuration

## Update a project

When the user wants to persist local changes, they encrypt the project using
the key in their vault, then send the update to the server:

```
PUT /api/projects/{projectID}
Authorization: Bearer {jwt}

{
  // Required, as this will always change for updates
  "encrypted": "v1.aesgcm256.c1f4d53c.M140NBtrhcygD_x7.uDJEkpydqvOfc7vZ7j6OwqTGsvrpk0GLgKbSKkqK",

  // Optional, to change the public key
  "publicKey": "bNBr9tPRAoQTl/VLwJw6ZaSy93DFU9g71vLwLhSuges=",

  // Optional, update public fields
  "public": {
    ...whatever is under the `public` field
  }
}

Response:
204 or 200, no need to return anything ?
```

## Delete a project

Deleting a project removes it from the database, deletes the Emitter config and
the public key from the registry.

Questions:

- Who can delete a project ? => only its creator
- What happens to Emitters still pinging that project ? => 404 or 410
- What about other users, sharing ? => pending investigation

The user calls:

```
DELETE /api/projects/{projectID}
Authorization: Bearer {jwt}

202 Accepted
```

If the call succeeds, they can then delete their local copy of the project
and remove the key from their keychain.

## Embed Script

Because we use subresource integrity, we should probably store the embed
script in the database next to the project data, so that future changes
in the embed script don't break it.
=> Or don't use srih altogether ?
