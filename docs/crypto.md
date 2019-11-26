# Cryptographic Concepts & Constructs

What is encrypted ?

- DataPoints are encrypted using a mix of ECDH and symmetric encryption.
  Current drafts are looking at using TweetNaCl's box algorithms, based on X25519-XChaCha20-Poly1305.
- The public key for encrypting DataPoints is one half of a key pair associated
  with a Project. The private key is stored in a Vault.
- Vaults are encrypted using symmetric keys stored in a Keychain
- Keychains are encrypted using a symmetric key derived from the password.
- SRP is being used to authenticate the requests to the server in a
  Zero-Knowledge manner.
- Team members use another layer of ECDH to exchange messages containing shared
  vault keys.
- Sensitive information should probably be encrypted in the database, for when
  it gets breached (eg: usernames/email addresses, TOTP secret keys, etc..)

## Encrypting Database Fields

Some information related to account management is still sent in clear text, as
it needs to be used by the server. Examples include:

- Usernames
- Email addresses
- 2FA TOTP private keys
- 2FA recovery codes

Those fields should be stored in an encrypted form in the database, for when
(not if, it's only a matter of time) the database gets breached.

> _**Note:** everything that is already E2EE by client-side keys (vault, keychain) probably does not need another layer of encryption._

Encryption should use a fast symmetric cipher, like AES-GCM with a 256 bit key.

The encrypted field should keep a record of:

- The algorithm used for encryption
- An identifier for the key
- Any parameter needed for decryption (eg: nonce, IV)
- The ciphertext

One proposed format is as follows:

```
v1.aesgcm256.c368e482.RvVUEis{...}2mgLNw=.nEuhqy3{...}pP1J+Q==
[].[   1   ].[  2   ].[        3        ].[        4         ]

[0]: Key encoding version, defines text structure
[1]: Algorithm + Parameters (here: AES-GCM, 256bit key)
[2]: Key fingerprint (8 first characters of SHA-256(key))
[3]: Nonce / IV
[4]: Ciphertext
```

Example output:

```
v1.aesgcm256.c1f4d53c.M140NBtrhcygD_x7.uDJEkpydqvOfc7vZ7j6OwqTGsvrpk0GLgKbSKkqK
```

### Key Storage

The key can be stored in the environment initially, until a rotation strategy
is defined.

### Key Acquisition

Storing a key in the environment is not ideal, as it can leak through logs and
general trust is required towards the application hosting service.

For a zero-trust (or at least low-trust) environment, a key acquisition scenario
must be evaluated.

Hashicorp Vault uses the Shamir Secret Sharing method to split a secret into
multiple fragments, each requiring cooperation with the others to retrieve and
decode the original secret.

### Key Rotation

Once key acquisition has been solved, it may become possible to rotate keys
securely.

Key rotation requires the following operations:

- Decrypt an existing field with the old key
- Encrypt it the cleartext value with the new key
- Update the encrypted record atomically

This should be done in parallel of normal operation, as both keys should be
available during rotation for the app to be able to work.

Once all the records have been updated, the old key can be discarded.

## DataPoints Cryptography

This is probably the easiest layer, because it needs to be simple to deploy
in the wild, as it will be used by the Visitors.

Visitors retrieve the Project public key along with configuration when they
bootstrap the visitor SDK.

They then generate a one-time-only X25519 key pair, perform an ECDH to derive
a symmetric key (XChaCha20-Poly1305) to encrypt their message, and pack the
nonce and public key in clear text along with the ciphertext. This bundle is
sent to the server queue. The private key is discarded, and a new key pair
will be generated for each subsequent message. No perfect forward secrecy à la WhatsApp here, as ratchet sync across multiple clients would be messy & hard.

On the receiving end, the project private key is available and used to perform
ECDH with the packed public key and decrypt the message.

## Vault Cryptography

A naive implementation of a crypto layer for the Vault would be to derive a symmetric key (eg: AES-GCM) from the master password (eg: using PBKDF2) and use that to encrypt/decrypt the Vault.

> What actually are the issues with this technique ? Other than it seeming naive. Rotating the password can be done as long as the Vault has been unlocked in advance. Authenticating the password change is up to SRP (see below).

_=>_ This is for password leaks. If the password is breached and someone else
had access to your account (and somehow did not lock you out of it), you can
log in and rotate your vault encryption key
=> But then they still have access to your data.. if the password is breached,
the whole system falls apart.
=> 2FA is needed.

_todo: Check how the others are doing_

_=>_ Having the keychain as an intermediate key repository is also good for teams
and scoping of protected content.

Bitwarden uses RSA to encrypt/decrypt the vault, and encrypts the RSA keys with
an AES key derived from the password.

---

User side
At account creation time:

- Generate an encryption key pair (RSA?), which will be used to encrypt/decrypt the vault
- Generate an empty vault
- Create an account by sending { email, sha256(email + password) } to the server
- Activate the account via email
  - The server generates a random token with a TTL of 48h and associates it with the email address
  - The server sends an email containing an activation link to the given email address, containing the token
  - When the link is clicked, the token is checked against the database entry for that email
    - if it matches:
      - the token is removed from the database
      - the account is marked as active
    - otherwise:
      - log the error
  - If the link is clicked after the TTL expired
    - propose to the user to re-send the activation email
- Derive an AES-GCM key from the password using PBKDF2 and a salt
- Encrypt the vault using the keychain
- Encrypt the keychain using the AES key
- Send the encrypted keychain, encrypted vault and salt to the server

Authenticating requests for keychain/vault/salt etc:

We want a zero-knowledge proof from the server that the client is who they claim to be, ie: they have both the email and the password.
Can the client hash sha256(email + password) and send that to the server as an identifier, or does a more complex exchange need to happen,
involving the server generating a nonce, storing it at account creation time and asking the

## Secure Remote Password

Objective: authenticating requests to the server without ever sending the
password, because keys are derived from it. Rather, send something derived
from the username and password, along with the means for the server to challenge
an attacker/eavesdropper.

SRP is defined in RFC-2945, it's a fairly standard and revised protocol.
It's used by:

- Bitwarden ? => login does not look like an entire SRP, password is PBKDF2'd
- ProtonMail
- Telegram
- RememBear

### Parameters & Algorithms

- Salt generation: use built-in vs WebCrypto `randomBytes`
- Hashing: SHA-256 (WebCrypto)
- KDF: PBKDF2 (WebCrypto `deriveBits`)

### Signup

The user provides:

- email address
- password

The client generates:

- A salt _(how many bytes ?)_

Handshake:

- **Client -> Server** Send `{ email, salt, verifier }`

#### Email Verification

This step runs for account creation and when a user changes their email address.
It is used to verify that the email link works, although it would be limited to
notifications of usage, billing and other business (rather than functional)
related matters.

The server generates a token (32 random bytes) and stores it in a database,
along with an expiration timestamp (48h) and the email it is supposed to be associated with.
The server sends an email to the address to verify, containing a link which
itself contains the token.
Eg: `https://example.com/auth/verify-email?token=foo`

When the link is clicked, the token is checked agains the database entry for that
email _(do we also put the email in the URL ? => bad for sniffing)_.
If it matches, the token is removed from the database and the account is marked as active.
If it does not match, we log the error:

- The token received
- Other info that can be obtained from the request (UA, IP etc..).

If the link is clicked after the TTL expired, propose to the user to re-send the activation email.

On why we're not adding the email addresses in the URL:

> How to ensure that email addresses are not sent in cleartext in the URL ? (because we don't want them scrapped, transferred, lost or whatever).
>
> - Encrypt them using a symmetric key stored along the token (don't use the token as the key, that would be stupid). But then if we don't have a matching token, we probably won't have a matching key and the encryption will be useless. Also, attackers will not use an email as the URL interaction method, so having the address in the URL to attempt to detect fraud makes little sense in the end.

The main attack vector here would be for someone to try and create an account
using an email address they do not control. We can log IPs for account creation
and email validation to see if there is some correlation.

### Login (without 2FA)

3-step handshake:

- **Client -> Server** Send public key (server can then do DH)
- **Client <- Server** Receive public key
- **Client -> Server**

### Sessions

Stateful sessions are used to allow a user to revoke all other sessions.
However, the system uses JWTs for session ID transport, to communicate some
information to the client in a self-contained form (userID, sessionID).

Sessions using 2FA are marked as active only when the TOTP code has been verified,
or a backup code used.

Sessions have a variable expiration date:

- Session for user without 2FA: 7 days
- Session for user with 2FA, unverified: 5 minutes
- Session for user with 2FA, verified: 7 days

The shorter span for 2FA verification prevents brute-forcing the 2FA token,
along with rate-limiting of the API routes at play.

See [Login with 2FA](#login-with-2fa)

A valid authentication JWT should pass signature & expiration date verification,
contain a valid sessionID which itself is not expired, and has a verified 2FA
status if applicable.

### Authenticating API Routes

The JWT is passed in the `Authorization: Bearer {jwt}` header for all
authenticated routes.
Failure to do so or invalid JWT (expired, signature mismatch, other error) will
result in a `401 Unauthorized` response. The client should then redirect to
the login page.

### Authenticating SSR Requests

The JWT is accessed through a `authorization-bearer-jwt` cookie. This cookie
should not be sent for API requests, nor for public routes.
getInitialProps can then extract the JWT from the cookie and either perform an
API call (for symmetry of data fetching) or verify it directly.

### Reset Password

Reset password via email is obviously impossible, as the master password is
the central key to all the crypto.

However, ProtonMail seem to have a way to reset an account password, because
they seem to have a mult-layer password system:

// Series derivation:
masterPW --(derive)--> accountPW --(derive)--> keysPW

Dangerous to reset the accountPW as it gives away the keys.

// Parallel derivation:
masterPW --(derive)--> accountPW (resetable)
•••L-------(derive)--> keysPW (non-resettable) => but then what's the point ?

Can it be possible to reset the accountPW without giving away all the keys to
the system ? This needs more investigation.

### Change password

Rotating the password (changing to a new one when knowing the old one) should be
an easy operation for a logged-in user. However, for more security, the old
password should be required to change either the email or provide a new password.

On the SRP side, changing the password will change the verifier. As a precaution,
we should probably rotate the salt as well.

Sending an authenticated POST request containing the new verifier and salt
could be sufficient in theory, but does not include password verification.
For that, we need to intertwine the signup and login flows.
The client will post their new username, salt and verifier with an authenticated
request.

---

> _**Note:** more details are needed on this_

---

### Change email

Changing the email should trigger the following actions:

- Verify the new email address (see [Email Verification](#email-verification))
- Send a notification email to the old email address (don't put any info there)

Security-wise, it should follow a similar verification flow as changing the
password.

### Activate 2FA

Features:

- Generate TOTP secret key server-side, mark it as pending, show it to the user
- Ask the user for a TOTP code to confirm
- Mark 2FA as active for the user in the backend
- Generate some backup/recovery codes and send them to the user

> _**Note**: the TOTP secret key should be stored in an encrypted form._
>
> _See [Encrypting Database Fields](#encrypting-database-fields)._

Generation of the TOTP secret key is done server-side in the settings.
Generate 8 recovery codes as UUIDv4, pass them through bcrypt/scrypt and store
their hashes in the database.

### Disable 2FA

Delete recovery codes

### Login with 2FA

When logging in without 2FA, the JWT authentication token is sent in the
response part of the login process. If the user has 2FA activated however,
that response part will not contain the JWT, but a field indicating the client
that 2FA is activated for that account and entering a TOTP token is required.
The client will give that option to the user, and send the token to
`/api/auth/login/2fa`, which will return the JWT if the TOTP token is valid.

Note: To avoid bruteforce attacks, the 2FA API route should be rate-limited
and sessions where 2FA has not been validated should have a shorter TTL.

Sessions should have a TTL of 5 minutes upon creation, then get extended to 7 days
upon validation of the TOTP token, or simply deleted after 5 failed attempts,
requiring the user/attacker to login again (which is slowed down due to PBKDF2
and also uses rate-limited routes).

### Login with 2FA Recovery Codes

Recovery codes have been generated when 2FA is activated and sent to the user
for safekeeping.

For cases where the user may not have access to their TOTP authenticator
(eg: lost/stolen phone), they can use a recovery code instead of the TOTP code
to verify the 2FA step (this does not override a password check).

If no TOTP token is sent during 2FA verification but a recoveryToken is present,
use this instead.
Verifying recovery tokens is done like a password, using bcrypt/scrypt. The
database contains a list of hashed tokens for a given user, and any used token
is removed from that list after verification.

Generating 8 tokens should be sufficient in a first time, as the user can still
deactivate and re-activate 2FA to re-generate 8 new tokens, which will replace
the old ones which should have been deleted when deactivating 2FA.

### Interesting Links

- https://core.telegram.org/api/srp
- https://github.com/LinusU/secure-remote-password
- https://github.com/simbo1905/thinbus-srp-npm
- https://www.remembear.com/blog/get-to-know-your-new-device-key/
- http://srp.stanford.edu/ndss.html
- https://www.youtube.com/watch?v=RWksEY-Bf9I

### DataPoints

Visitor wants to send data:

- Retrieve the ECDH X25519 public key for the project from the server in the visitor script configuration
- For each Data Point to send:
  - Generate a temporary ECDH X25519 key pair
  - Perform ECDH with the project public key to obtain an AES-GCM key
  - Encrypt the payload with that key
  - Send both the payload and the generated public key to the server
  - Throw away the keys.

Dashboard receives an encrypted Data Point:

- Separate the visitor ECDH X25519 public key and the encrypted payload
- Perform ECDH with the project ECDH X25519 secret key to obtain the AES-GCM key
- Decrypt the payload with that key
- Throw away the encrypted package (mark it as processed ?)

Dashboard side:

- Projects have a X25519 key pair, the public key is sent to the server in clear text to be served to the visitors, the private key (and a copy of the public key) remain in the vault.

```

```
