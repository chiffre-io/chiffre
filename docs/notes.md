# Notes

Group Key agreement
Possible actions:

- invite new member to the group
- rotate group key
- revoke member access (implies a key rotation)
- revoke own access (also requires key rotation for others)
-

SRP:

- Find ways to avoid attacks on the initial auth handshake
  - reuse incomplete sessions
  - rate limit
  - objective is to avoid learning too much about the sign-up keys by calling the initial handshake repeatedly
    Username should be sent in clear text but logged as anonymised like sha256(email)

Exchanges & endpoints

- POST /api/auth/signup
- POST /api/auth/login/challenge
- POST /api/auth/login/response
- POST /api/auth/login/2fa
- POST /api/auth/logout

DB tables:

- auth_users
  - username
  - salt
- auth_pending_logins -> is it needed ?
  - ID
  - initiated at
  - num tries -> for rate limiting ?
  - SRP parameters & intermediaries (private key)
  - expires at (protection against stuffing with cleanup Cron)

JWT signing keys based on session key: the server needs to lookup the session key to validate the JWT: not optimal (creates bottleneck)
But easy way to invalidate just one JWT for the targeted account: delete the session key.

## Push service

Add the following script tag to your web page :

```
<script
  src="https://embed.chiffre.io/2e2673f4-3170-48ce-8aa7-599c820a54df"
  integrity="sha256-3swi72MfFJ+fytgKKnfLluZKjAmSqwnYoMfQGi3cMik="
  crossorigin="anonymous"
  async=""
></script>
```

https://push.chiffre.io/{projectID}
mvp: /api/push/{projectID}

GET: retrieve configuration & public key
POST: push some encrypted data

For the MVP, keep everything in the house:
GET /api/push/{projectID}
POST /api/push/{projectID}

Authentication: none, but domain has to be equal to the one in the config.
=> Therefore, the backend needs to know it publicly.

MVP: for now accept everything

## Flow

- Signup:

  - Create SRP auth params
  - Create (empty) Keychain
    => get a userID back ?

- Post-Login:
  - Calculate master key
  - Retrieve keychain
  - Decrypt keychain
  - Keychain has `username` vault ?
    => yes: ok
    => no
    - Create `username` (empty) vault
    - Generate vault key
    - Upload to server => get vaultID
    - Store key in keychain
    - Encrypt and update keychain

## Encrypted Key Containers | Data Model

At the moment we're looking at storing key containers (keychain, vault, project)
in a compact encrypted text form.

ProtonMail seems to use a different approach: they expand the key-value object
in their database, and encrypt only the values.

This allows them to control entities relations, for many reasons:

- Single source of truth (no distributed datastores)
- Enforcing of data relationship validity thanks to SQL
- Access control based on roles and plans (eg: limit sharing for free plans)
- Ease of distributed state updates:
  - Merge by field rather than by black box (overwrite & notify subscribers)
  - No need for versioning (use DB migrations)
  - Minimal data fetching over only what's needed (GraphQL ?)
- General view of what's going on in the system for analysis of business model,
  without actually having any insight on values (sensitive data).

## Token-Based Vault Access

Vaults can be accessed using a token, rather than with username/password which
is the prefererred method for human users. Bots and automation tools use tokens
to authenticate.

Features:

- Revokable
- Optional lifetime control (TTL)
- Bound to an account (cleartext token value only visible by that account)
- One token is bound to a single vault. A vault may have more than one tokens
  bound to it.
- Tokens unlock full access to the vault contents. Use multiple vaults for fine
  grain access control between tokens.

Questions:

- How to handle login ?
- How to handle sessions & auth ?
- How to handle vault key sharing (duplication & sync) ?

Ideas:

Creating a token creates:

1. A master salt (tokenSalt) which will be used for PBKDF2
2. A lightweight keychain (tokenKeychain)

The tokenSalt will be used to do PBKDF2(token, tokenSalt) and get a tokenKey.
The tokenKeychain will contain one or many vault keys (shared with other users).
The tokenKey will encrypt the tokenKeychain
The encrypted tokenKeychain and the tokenSalt will be stored on the server
The token is stored in its creator's keychain along with metadata about what
it contains.

To log in using a token:

- Retrieve the tokenSalt (how ? => we need a public ID system)
- tokenKey = PBKDF2(token, tokenSalt)
- Retrieve the tokenKeychain (how => same ID system)

How to revoke access ?

- Delete the entries in the database => no auth possible (no salt or encrypted
  keychain).

How to handle TTL ?

- Cannot be stored in cleartext in the database as it can be tampered with.
- Signed message containing the TTL, that can be verified with a public key
  - Signed by who ? => the creator of the token
- System can check validity of the signature and respect TTL
  - System has to be able to retrieve the associated public key, so we need
    a record of {userID, tokenID}

Account binding is done by placing the token cleartext in its creator's keychain
therefore making it impossible for anyone else to access it.

How to share vault key with a token ?

How to revoke vault access ?

## Data Crunching

Incoming events can be represented as a stream, over which analysis algorithms
are applied. Those algorithms may have an internal state, which may get updated
for earch event passing through.

```
  Event -----> |-----------| -----> Digest
  State -----> | Algorithm | -----> New State
               |-----------|
```

Some examples: measuring session time.

## Digest Consensus

Because requiring every client to work on the raw data is a waste of resources
for everyone, we want the clients to process the raw data, then re-upload the
digested analytics encrypted onto our platform, so that other clients can only
query the existing pre-digested data and only do a minimum amount of work on
the newest real-time data (which can be done by a headless worker for even more
efficiency).

However, since there might be more than one worker, we need a way to make sure
that the digested state stays consistent and follows a consensus among all the
workers / clients.

For that, we propose a mini-blockchain solution, where raw data is processed in
batches by the workers, who push digest state updates as a blockchain block,
and achieve consensus by "first to push".
The blockchain structure is only here to help memorize history of which pieces
of raw data were already processed. This data can be sent in clear-text to help
reduce resources on our servers, and give low-priority of analyzed data points
(or delete them altogether for free plans with limited data retention).
The digested state should obviously be sent encrypted to our servers.

Therefore, a project would be represented by a pair of key pairs:

- Emitter Key Pair - To encrypt raw data transfer
  - Emitter has the public key
  - Worker has the secret key
- Worker Key Pair - To encrypt digested analytics
  - Worker has the public key
  - Clients have the secret key

```
                          T         T+D     t    T+2D
[------------][----------]|[-------------][-|-------]
  Digest n-1    Digest n  |  next window    |
   block-based analysis <-|-> real-time analysis

next window analysed when t = T + 2D
```

## Chiffre Client

```ts
import Chiffre from '@chiffre/client'

const chiffre = new Chiffre({
  // All options can be overriden by environment variables
  // Customizable for self-hosting ?
  apiUrl: 'https://api.chiffre.io'
})

// Authentication

await chiffre.signup('username', 'password')

chiffre.loginWithUsernamePassword('foo@bar.com', 'password')
// or
await chiffre.loginWithToken('0b0ef3403bbe41bdb9c45ad3d95d0d4d')

// 2FA
const {
  success: Promise<boolean>,
  twoFactorRequired: Promise<boolean>,
  submitTwoFactorToken: (token: string) => Promise<void>
} = chiffre.loginWithUsernamePassword('foo@bar.com', 'password')

// List available vaults
const vaults: Vault[] = await chiffre.vaults.list()

await chiffre.vaults.create()

// Encrypt something to go in a vault
const locked = await chiffre.vaults.lockItem('key', 'value', 'vaultID')
const clear = await chiffre.vaults.unlockItem('key', 'vaultID')

// Vault operations
await chiffre.vaults.rotate('vaultID')
await chiffre.vaults.invite('username', 'vaultID')
await chiffre.vaults.revoke('username', 'vaultID')

// Rotate keychain key
await chiffre.keychain.rotate()

chiffre.logout()
```
