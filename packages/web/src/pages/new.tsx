import React from 'react'
import { NextPage } from 'next'
import { Box, Heading, Text, Divider } from '@chakra-ui/core'
import { useChiffreClient } from '@chiffre/client-react'
import Body from '../components/primitives/Body'
import NewProjectForm, { Values } from '../views/new/NewProjectForm'

const NewPage: NextPage = () => {
  const client = useChiffreClient()
  const availableVaults = React.useMemo(() => {
    return Array.from(new Set(client.projects.map(p => p.vaultID)))
  }, [client.projects])

  const submit = async (values: Values) => {
    const project = await client.createProject()
    // now what ?
  }
  const cancel = () => {}

  return (
    <>
      <Body shade={100} />
      <Box
        maxW="lg"
        mt={8}
        mx="auto"
        backgroundColor="white"
        p={4}
        boxShadow="sm"
        borderRadius="5px"
        overflow="auto"
      >
        <Heading as="h2" fontSize="xl" mb="1" fontWeight="normal">
          Create a new project
        </Heading>
        <Text fontSize="sm" color="gray.600" mb={6}>
          A project collects all analytics for a given website or webapp.
        </Text>
        <Divider />
        <NewProjectForm onSubmit={submit} onCancel={cancel} />
      </Box>
    </>
  )
}

export default NewPage
