import React from 'react'
import { NextPage } from 'next'
import { Button, Flex } from '@chakra-ui/core'
import {
  pushDataPoint,
  VisitorConfig,
  fetchConfig
} from '../src/client/engine/visitor'

const useVisitorConfig = () => {
  const [config, setConfig] = React.useState<VisitorConfig>(null)

  React.useEffect(() => {
    fetchConfig().then(setConfig)
  }, [])

  return config
}

const VisitorPage: NextPage = ({}) => {
  const config = useVisitorConfig()
  const logAction = (type: string) => () => {
    pushDataPoint({ type }, config)
  }

  return (
    <Flex maxW="600px" margin="4rem auto" justifyContent="space-around">
      <Button onClick={logAction('A')} variantColor="purple">
        Action A
      </Button>
      <Button onClick={logAction('B')} variantColor="teal">
        Action B
      </Button>
      <Button onClick={logAction('C')} variantColor="orange">
        Action C
      </Button>
    </Flex>
  )
}

export default VisitorPage
