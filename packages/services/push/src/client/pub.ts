import WebSocket from 'isomorphic-ws'

const client = new WebSocket(`ws://push.chiffre.io/publish/${process.argv[2]}`)

let interval = null

client.on('open', () => {
  console.log('Publisher connected')
  interval = setInterval(() => {
    const msg = Math.round(Math.random() * (1 << 20)).toString(16)
    client.send(msg)
  }, 1000)
})

client.on('close', (code, reason) => {
  clearInterval(interval)
  console.log('Publisher disconnected', code, reason)
})
