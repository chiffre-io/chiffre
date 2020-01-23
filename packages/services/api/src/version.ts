// This file will be injected with hardcoded version info at build time,
// then replaced in the dist/ folder.

// https://docs.npmjs.com/misc/scripts#packagejson-vars
const version = process.env.npm_package_version || 'x.x.x'
const commit = process.env.COMMIT_ID || 'dev' // on Clever Cloud
const name = 'api'

export default `${name}@${version}-${commit.slice(0, 8)}` as string
