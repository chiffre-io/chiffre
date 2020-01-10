const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

const commonConfig = {
  client: 'pg',
  connection: process.env.DATABASE_URI,
  migrations: {
    directory: './src/db/migrations',
    extension: 'ts',
    loadExtensions: ['.ts']
  }
}

module.exports = {
  development: {
    ...commonConfig,
    seeds: {
      directory: './src/db/seeds',
      loadExtensions: ['.ts']
    }
  },
  production: {
    ...commonConfig
  }
}
