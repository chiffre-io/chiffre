import NodeWebCrypto from 'node-webcrypto-ossl'

const webcrypto =
  typeof window === 'undefined' ? new NodeWebCrypto() : window.crypto

export default webcrypto
