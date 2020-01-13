require('dotenv').config()
require('env-alias').default()

const path = require('path')
const webpack = require('webpack')
const withSourceMaps = require('@zeit/next-source-maps')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

const loadFromEnv = names => {
  const out = {}
  for (const name of names) {
    out[name] = process.env[name]
  }
  return out
}

module.exports = withBundleAnalyzer(
  withSourceMaps({
    // Will be available both in the client and server
    env: loadFromEnv(['API_URL', 'APP_URL', 'SENTRY_DSN']),

    webpack: (config, { isServer, buildId }) => {
      // Fixes npm packages that depend on `fs` module
      config.node = {
        fs: 'empty'
      }
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.SENTRY_RELEASE': JSON.stringify(buildId)
        })
      )
      config.resolve.alias['~'] = path.resolve(__dirname)
      return config
    }
  })
)
