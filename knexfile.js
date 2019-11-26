const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URI,
  migrations: {
    directory: './src/server/db/migrations',
    extension: 'ts',
    loadExtensions: ['.ts']
  },
  seeds: {
    directory: './src/server/db/seeds',
    loadExtensions: ['.ts']
  }
}
