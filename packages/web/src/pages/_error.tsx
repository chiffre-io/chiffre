import React from 'react'
import { useRouter } from 'next/router'
import { Text, Stack, Heading, Code, Button } from '@chakra-ui/core'
import MainPage from '../layouts/MainPage'

const Error = ({ ...props }) => {
  const router = useRouter()

  const debugInfo = Object.entries({
    props: JSON.stringify(props),
    pathname: router?.pathname,
    asPath: router?.asPath
  })
    .reduce((arr, [key, val]) => [...arr, [key, val].join(': ')], [])
    .join('\n')

  return (
    <MainPage>
      <Stack
        maxW="xl"
        my={8}
        p={4}
        bg="white"
        shadow="md"
        borderRadius={4}
        mx="auto"
      >
        <Heading as="h2" fontSize="lg" fontWeight="medium" color="red.700">
          An unknown error occurred
        </Heading>
        <Text fontSize="sm">Props:</Text>
        <Code as="pre" fontSize="xs" p={2} bg="red.50">
          {JSON.stringify(props, null, 2)}
        </Code>
        <a
          href={`mailto:contact+report@chiffre.io?subject=Error%20report&body=${encodeURIComponent(
            debugInfo
          )}`}
        >
          <Button variantColor="red" mt={8}>
            Report error
          </Button>
        </a>
      </Stack>
    </MainPage>
  )
}

export default Error
