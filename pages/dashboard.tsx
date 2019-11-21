import React from 'react'
import nacl from 'tweetnacl'
import { NextPage } from 'next'
import {
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup
} from '@chakra-ui/core'

import socketIo from 'socket.io-client'
import { DataPoint, decryptDataPoint } from '../src/client/engine/crypto'
import { b64 } from '../src/client/engine/crypto/primitives/codec'

const useDataPointsFeed = () => {
  const [data, setData] = React.useState<any[]>([])

  const pushData = (dataPoint: any) =>
    setData(existing => [...existing, dataPoint])

  React.useEffect(() => {
    const keyPair = nacl.box.keyPair()
    const url = process.env.APP_URL || 'http://localhost:3000'
    console.log(url)
    const socket = socketIo(url, {
      query: {
        publicKey: b64.encode(keyPair.publicKey)
      }
    })
    socket.on('connect', () => console.log('Socket connected'))
    socket.on('disconnect', () => console.log('Socket disconnected'))
    socket.on('data-point', (data: DataPoint) => {
      console.log(data)
      const d = decryptDataPoint(data, keyPair.secretKey)
      if (!d) {
        // Can fail if visitor used an old public key to encrypt
        return
      }
      pushData(d)
    })
    return () => {
      socket.close()
    }
  }, [])

  return data
}

const DashboardPage: NextPage = () => {
  const data = useDataPointsFeed()

  const numA = data.filter(({ type }) => type === 'A').length
  const numB = data.filter(({ type }) => type === 'B').length
  const numC = data.filter(({ type }) => type === 'C').length

  return (
    <>
      <Heading>Dashboard</Heading>
      <StatGroup>
        <Stat>
          <StatLabel>Action A</StatLabel>
          <StatNumber>{numA > 0 ? numA : '--'}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Action B</StatLabel>
          <StatNumber>{numB > 0 ? numB : '--'}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Action C</StatLabel>
          <StatNumber>{numC > 0 ? numC : '--'}</StatNumber>
        </Stat>
      </StatGroup>
    </>
  )
}

export default DashboardPage
