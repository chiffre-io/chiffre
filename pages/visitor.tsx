import React from 'react'
import { NextPage } from 'next'
import { Button, Flex } from '@chakra-ui/core'
import { VisitorConfig, fetchConfig } from '../src/client/engine/visitor'
import ConsentManager from '../src/client/components/ConsentManager'
import useEvent from '../src/client/hooks/useEvents'

const useVisitorConfig = () => {
  const [config, setConfig] = React.useState<VisitorConfig | null>(null)

  React.useEffect(() => {
    fetchConfig().then(setConfig)
  }, [])

  return config
}

const VisitorPage: NextPage = ({}) => {
  const config = useVisitorConfig()

  return (
    <>
      <Flex maxW="600px" margin="4rem auto" justifyContent="space-around">
        <Button onClick={useEvent('A', config)} variantColor="purple">
          Action A
        </Button>
        <Button onClick={useEvent('B', config)} variantColor="teal">
          Action B
        </Button>
        <Button onClick={useEvent('C', config)} variantColor="orange">
          Action C
        </Button>
      </Flex>
      <ConsentManager />
    </>
  )
}

export default VisitorPage
