import { b64 } from '@47ng/codec'
import { pbkdf2DeriveBytes } from './pbkdf2'

describe('crypto/primitives/pbkdf2', () => {
  test('deriveBytes', async () => {
    const salt = b64.decode('YgTYuP5CFq4GPrfqRwxWk7EJfI-vQ_HMERlewxYRS08=')
    const key = await pbkdf2DeriveBytes('password', salt, 32, 'SHA-256', 100)
    expect(b64.encode(key)).toEqual(
      'nAqwUsgC-Cw5Okbv9UzdzudVsoX1xvW-__r9qqSaVWM='
    )
  })
})
