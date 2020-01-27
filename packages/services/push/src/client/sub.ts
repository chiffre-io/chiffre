import WebSocket from 'isomorphic-ws'

const client = new WebSocket(`ws://localhost:3000/subscribe/${process.argv[2]}`)

client.on('open', () => {
  console.log('Subscriber connected')
})

client.on('message', message => {
  console.log(message)
})

client.on('close', (code, reason) => {
  console.log('Subscriber disconnected', code, reason)
})
