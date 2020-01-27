import nacl from 'tweetnacl'
import { b64 } from '@47ng/codec'
import { encryptString, decryptString } from './index'

test('codec', () => {
  const keyPair = nacl.box.keyPair()
  const expected = 'Hello, World !'
  const message = encryptString(expected, keyPair.publicKey)
  const received = decryptString(message, keyPair.secretKey)
  expect(received).toEqual(expected)
})

test('Known test vector', () => {
  const secretKey = '_dI3REFDpIehLTNV1_v-1qp0woWqvY66Xw4UXdFAJI8='
  const message =
    'v1.naclbox.Eu6k3DshffqkRnqhtCFfZA4SCzgrxqXX6GeY1LbBZT0=.utf8.LQ6atta_ET_-jLN2aLpKNIa35bDhxRum.ivrW2XNVK0_5Fc27oZpG3_onzX2U4Gg52oTbcEhN'
  const keyPair = nacl.box.keyPair.fromSecretKey(b64.decode(secretKey))
  const expected = 'Hello, World !'
  const received = decryptString(message, keyPair.secretKey)
  expect(received).toEqual(expected)
})
