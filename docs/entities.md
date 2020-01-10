# Database entities

## User Auth SRP

Contains the SRP parameters obtained from the user at signup and used for login.

- Username, for challenge indexing
- Master Salt (for PBKDF2'ing the username & password into the Master Key).
- SRP Verifier & SRP Salt, for SRP login flow

## Token Auth SRP

Similar to User Auth SRP, but for token-based logins.

Token-based login also uses SRP. The username is replaced by the SHA-256 hash
of the token value

- Fingerprint: SHA-256(token), acts as the username
- Master Salt, for PBKDF2
- SRP Verifier & Salt
- Created By (userID)
- Scopes, roles & other authorization fields can go there too
