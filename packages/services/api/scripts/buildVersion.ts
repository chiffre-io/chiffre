import fs from 'fs'
import path from 'path'
import versionString from '../src/version'

const filePath = path.join(path.dirname(__filename), '../dist/version.js')
const fileContents = `module.exports = "${versionString}"
`

fs.writeFileSync(filePath, fileContents)
console.info(`Generated version file (${versionString})`)
