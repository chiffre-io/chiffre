import nacl from 'tweetnacl'
// import api from '~/src/client/api'
// import { MessageQueueResponse } from '~/packages/web/pages/api/queues/[projectID]'
// import { Event } from '~/src/emitter/events'
// import { b64, encoders, Encoding } from '@47ng/codec'

// export const fetchProjectDataPoints = async (projectID: string) => {
//   const url = `/queues/${projectID}`
//   const messages = await api.get<MessageQueueResponse[]>(url)
//   return messages
// }

// const decryptString = async (input: string, secretKey: string) => {
//   if (!input.startsWith('v1.')) {
//     throw new Error('Unknown format')
//   }
//   const [_, algo, publicKey, encoding, nonce, ciphertext] = input.split('.')
//   if (algo !== 'naclbox') {
//     throw new Error('Unsupported cipher')
//   }
//   const cleartext = nacl.box.open(
//     b64.decode(ciphertext),
//     b64.decode(nonce),
//     b64.decode(publicKey),
//     b64.decode(secretKey)
//   )
//   const encode = encoders[encoding as Encoding]
//   return encode(cleartext)
// }

// export const decryptMessage = async (
//   dataPoint: MessageQueueResponse,
//   projectSecretKey: string
// ) => {
//   const json = await decryptString(dataPoint.message, projectSecretKey)
//   const event: Event = JSON.parse(json)
//   return {
//     id: dataPoint.id,
//     event
//   }
// }
