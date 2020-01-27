import { Transform } from 'stream'
import WebSocket from 'ws'
import commander from 'commander'
import { b64 } from '@47ng/codec'
import { encryptString, sha256 } from '@chiffre/crypto-box'

const defaultUrl = 'https://push.chiffre.io'

export default async function startApplication(args: string[]) {
  const program = new commander.Command()

  const app = program
    .option('-f, --forward-stdin', 'Forward stdin to stdout', false)
    .requiredOption('-p, --public-key <publicKey>', 'Public key')
  app.parse(args)
  process.stdin.setEncoding('utf8')
  if (app.forwardStdin) {
    process.stdin.pipe(process.stdout)
  }

  const publicKey = b64.decode(app.publicKey as string)
  const roomID = await sha256(publicKey)
  const url = `${app.url || defaultUrl}/publish/${roomID}`

  const splitLines = new Transform({
    encoding: 'utf8',
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, _encoding, callback) {
      callback(null, chunk.replace('\n', ''))
    }
  })

  const encrypt = new Transform({
    encoding: 'utf8',
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, _encoding, callback) {
      const message = encryptString(chunk, publicKey)
      callback(null, message)
    }
  })

  const socket = new WebSocket(url, {})
  socket.on('close', (code, reason) => {
    console.log(
      `Socket disconnected (${code}: ${reason || 'no reason specified'})`
    )
  })
  socket.on('error', error => {
    console.error(error)
  })
  socket.on('open', () => {
    console.log(`Connected to socket at ${url}`)
    const wsStream = WebSocket.createWebSocketStream(socket, {})
    process.stdin
      .pipe(splitLines)
      .pipe(encrypt)
      .pipe(wsStream)
  })
}
