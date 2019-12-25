const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

const commonConfig = {
  client: 'pg',
  connection: process.env.DATABASE_URI,
  migrations: {
    directory: './src/server/db/migrations',
    extension: 'ts',
    loadExtensions: ['.ts']
  }
}

module.exports = {
  development: {
    ...commonConfig,
    seeds: {
      directory: './src/server/db/seeds',
      loadExtensions: ['.ts']
    }
  },
  production: {
    ...commonConfig
  }
}
