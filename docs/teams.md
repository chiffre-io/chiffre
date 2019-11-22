# Teams / Organisations

Actions:

- Invite someone to a team
  - They will probably not have an account => cannot send an encrypted message without a public key
  - If they do:
    - Encrypt the org vault shared key and send a message
- Revoke a member’s access from a team
  - Must be a member to do so (attack vector)
  - Might need consensus or approval from other members to rotate the org vault key
  - Self-revokation (leave org), implying key rotation.
- Key rotation (see revoke)

Key rotation is necessary when a member leaves to prevent them from copying the key to the shared vault, but then again they could have copied the project private key, so how to make sure they can no longer decrypt data from a project they have been revoked from ?

Invitation mechanism:

There are multiple cases that can happen:

1. The inviter invites the invitee
   1. and the invitee has no account (no public key)
   2. and the invitee already has an account (therefore a public key)
2. The invitee requests an invite to join the org

Scenarios #1.x:
The inviter will fill a form requesting an email address to invite. The server will check if there is an account for that email address, which will determine if scenario 1.1 or 1.2 will occur.

Scenario 1.1: an email is sent to the invitee saying “{inviter} invited you to join {org}, create your account”
The link contains the inviter’s public key, used to send them a message saying “invite accepted, please send the shared key, here’s my public key”.
This will trigger a notification email sent to the inviter to move to phase 1.2:

Scenario 1.2: the inviter gets the public key of the invitee and sends them the encrypted shared key.

Scenario 2:
Pre-requisite: the invitee must already have an account
The invitee sends a request to join the org along with their public key.
The org creator / admin is sent an email containing the request details (name & email), with an accept button containing the invitee’s public key.
They can then use it to encrypt and send the org shared key.

Sharing projects

When creating a project, it can be personal (living in your own vault) or belong to an organisation. It must be possible to move a personal project into an organisation, but not the opposite.

When the last person of an organisation leaves it, it is destroyed, along with all the projects it contains. This critical operation might require more confirmation than usual. It is not possible to delete an organisation with more than one member (they all have to leave first).
