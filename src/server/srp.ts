// Test for secure-remote-password's implementation
// Generate images with outputs of random generators
// to visualize entropy distribution.

// import srp from 'secure-remote-password/client'
// import Jimp from 'jimp'

// 256 bits -> 16x16px square, each px is a bit (black or white)
// 256x256 squares = 65536 squares -> 1 image (4096x4096px, 16Mb)
// 256 images superimposed (alpha of 1 for each image + flatten) -> 4Gb visualized

// const makeMatrix = (x: number, y: number) =>
//   Array(y)
//     .fill(null)
//     .map(() => Array(x).fill(null))

// const bufferToArrayOfBits = (b: Buffer) => {
//   const out = []
//   const L = b.length
//   for (let i = 0; i < L; ++i) {
//     const uint8 = b.readUInt8(i)
//     for (let bit = 0; bit < 8; ++bit) {
//       const x = (uint8 & (1 << bit)) === 0 ? 0 : 1
//       out.push(x)
//     }
//   }
//   return out
// }

// const M = makeMatrix(8, 1600).map(row =>
//   row
//     .map(() => {
//       const salt = srp.generateSalt() // 256 bits long
//       const buff = Buffer.from(salt, 'hex')
//       const bits = bufferToArrayOfBits(buff)
//       return bits
//     })
//     .reduce((arr, cell) => [...arr, ...cell], [])
//     .map(px => (px === 1 ? 0xffffffff : 0xff000000))
// )

// const image = new Jimp(2048, 1600, (err, img) => {
//   if (err) throw err

//   M.forEach((row, y) => {
//     row.forEach((color, x) => {
//       image.setPixelColor(color, x, y)
//     })
//   })

//   image.write('test.png', err => {
//     if (err) throw err
//   })
// })
