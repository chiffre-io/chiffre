const path = require('path')

const commonConfig = {
  client: 'pg',
  connection: process.env.DATABASE_URI,
  migrations: {
    directory: path.join(path.dirname(__filename), 'src/db/migrations'),
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
