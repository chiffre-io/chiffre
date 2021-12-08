import chalk from 'chalk'
import { build, BuildOptions, BuildResult } from 'esbuild'
import prettyBytes from 'pretty-bytes'
import { outputBundlePath, trackerEntrypoint } from './paths'

const options: BuildOptions = {
  entryPoints: [trackerEntrypoint],
  outfile: outputBundlePath,
  bundle: true,
  minify: true,
  treeShaking: true,
  sourcemap: true,
  format: 'iife',
  globalName: 'chiffre',
  logLevel: 'info',
  target: ['es6'],
  metafile: true,
  external: [
    // Strip the following dependencies from the output bundle:
    'buffer',
    'crypto',
    'faker',
    'tapers',
    'ms'
  ],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}

// --

async function printReport({ metafile }: BuildResult) {
  if (!metafile) {
    return
  }
  const bundle = metafile.outputs['public/analytics.js']

  interface Chunk {
    path: string
    size: number
    icon: string
    ratio: number
    prettySize: string
  }

  const chunks: Chunk[] = Object.keys(bundle.inputs)

    .sort(
      // Largest first
      (a, b) => bundle.inputs[b].bytesInOutput - bundle.inputs[a].bytesInOutput
    )
    .reduce<Chunk[]>(
      (arr, key, index, paths) => [
        ...arr,
        {
          path: key,
          size: bundle.inputs[key].bytesInOutput,
          ratio: bundle.inputs[key].bytesInOutput / bundle.bytes,
          prettySize: prettyBytes(bundle.inputs[key].bytesInOutput),
          icon: index === paths.length - 1 ? '└' : '├'
        }
      ],
      []
    )
    .filter(chunk => chunk.size > 0)
  const prettyBundleSize = prettyBytes(bundle.bytes, {
    minimumFractionDigits: 2
  })

  const pathPadding =
    4 +
    chunks.reduce(
      (max, chunk) =>
        Math.max(max, chunk.path.length, 'public/analytics.js'.length),
      0
    )
  const sizePadding = chunks.reduce(
    (max, chunk) =>
      Math.max(max, chunk.prettySize.length, prettyBundleSize.length),
    0
  )

  let report = [
    [
      'public/analytics.js'.padEnd(pathPadding + 4),
      prettyBundleSize.padStart(sizePadding)
    ].join(''),
    ...chunks.map(chunk => {
      const sizeColor =
        chunk.size > 10000
          ? chalk.redBright
          : chunk.size > 1000
          ? chalk.yellowBright
          : chalk.greenBright
      const moduleColor = chunk.path.startsWith('node_modules')
        ? chalk.blue.dim
        : chalk.blueBright
      const shiftPad = chunk.prettySize.endsWith(' B') ? 1 : 0
      return [
        '  ',
        chalk.dim(chunk.icon),
        ' ',
        moduleColor(chunk.path.padEnd(pathPadding - shiftPad)),
        sizeColor(chunk.prettySize.padStart(sizePadding).padEnd(shiftPad)),
        chalk.dim(
          `${(chunk.ratio * 100).toFixed(1)}%`.padStart(
            ' xxx.x%'.length + shiftPad
          )
        )
      ].join('')
    }),
    ''
  ].join('\n')
  console.info(report)
}

// --

if (require.main === module) {
  build(options)
    .then(printReport)
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
