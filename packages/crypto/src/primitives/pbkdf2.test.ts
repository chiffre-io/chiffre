import { pbkdf2DeriveBytes } from './pbkdf2'
import { b64 } from './codec'

describe('PBKDF2', () => {
  test('deriveBytes', async () => {
    const salt = b64.decode('YgTYuP5CFq4GPrfqRwxWk7EJfI-vQ_HMERlewxYRS08=')
    const key = await pbkdf2DeriveBytes('password', salt, 32, 'SHA-256', 100)
    expect(b64.encode(key)).toEqual(
      'nAqwUsgC-Cw5Okbv9UzdzudVsoX1xvW-__r9qqSaVWM='
    )
  })
})
