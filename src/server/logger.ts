import { createRootLogger, createChildLogger } from 'next-logger'

export const rootLogger = createRootLogger(
  // Redact values of those environment variables in logs:
  [
    'DATABASE_URI',
    'JWT_SECRET',
    'CLOAK_MASTER_KEY',
    'CLOAK_KEYCHAIN',
    'CLOAK_CURRENT_KEY'
  ],
  // Redact those fields from logs:
  []
)

export const appLogger = createChildLogger(rootLogger, 'app')
