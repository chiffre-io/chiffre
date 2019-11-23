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

- Bitwarden ?
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

### Change password

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

### Change email

### Activate 2FA

### Disable 2FA

### Login (with 2FA)

### Interesting Links

- https://core.telegram.org/api/srp
- https://github.com/LinusU/secure-remote-password
- https://github.com/simbo1905/thinbus-srp-npm
- https://www.remembear.com/blog/get-to-know-your-new-device-key/
- http://srp.stanford.edu/ndss.html
- https://www.youtube.com/watch?v=RWksEY-Bf9I

### Challenges

- How to change username (ie: email address ?)
  - => Changing an account’s email address requires more care than just SRP considerations, like new email confirmation, old email notification (although there is not much we can do in this case)
- How to change password ?
- How to implement 2FA on top of that ?

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
