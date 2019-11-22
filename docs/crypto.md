# Cryptographic Concepts & Constructs

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

=> Check out SRP (RFC-2945)

- https://core.telegram.org/api/srp
- https://github.com/LinusU/secure-remote-password#readme
- https://github.com/simbo1905/thinbus-srp-npm
- https://www.remembear.com/blog/get-to-know-your-new-device-key/
- http://srp.stanford.edu/ndss.html
- https://www.youtube.com/watch?v=RWksEY-Bf9I

Issues with SRP

- How to change username (ie: email address ?)
  - => Changing an account’s email address requires more care than just SRP considerations, like new email confirmation, old email notification (although there is not much we can do in this case)
- How to change password ?
- How to implement 2FA on top of that ?

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
