import path from 'node:path'

export const repoRootDir = path.resolve('modules/../..')
export const trackerSourceDir = path.resolve(__dirname, '../src')
export const versionFilePath = path.resolve(trackerSourceDir, 'version.ts')
export const trackerEntrypoint = path.resolve(trackerSourceDir, 'main.ts')
export const outputBundlePath = path.resolve(
  repoRootDir,
  'public',
  'analytics.js'
)
