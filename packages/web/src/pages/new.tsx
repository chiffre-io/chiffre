import React from 'react'
import { NextPage } from 'next'
import {
  Box,
  Heading,
  Text,
  Divider,
  Collapse,
  Code,
  Stack
} from '@chakra-ui/core'
import { Project } from '@chiffre/client'
import { useChiffreClient } from '../hooks/useChiffreClient'
import Body from '../components/primitives/Body'
import NewProjectForm, { Values } from '../views/new/NewProjectForm'
import MainPage from '../layouts/MainPage'
import Header from '../components/Header'
import { ButtonRouteLink } from '../components/primitives/Links'

const NewPage: NextPage = () => {
  const client = useChiffreClient()
  const [project, setProject] = React.useState<Project>(null)

  const availableVaults = React.useMemo(() => {
    return Array.from(new Set(client.projects.map(p => p.vaultID)))
  }, [client.projects])

  const submit = async (values: Values) => {
    console.dir(values)
    const project = await client.createProject({
      name: values.name,
      description: values.description,
      url: values.deploymentURL
    })
    setProject(project)
  }

  return (
    <MainPage>
      <Header />
      <Body shade={100} />
      <Box
        maxW="xl"
        mt={8}
        mx="auto"
        backgroundColor="white"
        p={4}
        boxShadow="sm"
        borderRadius="5px"
        overflow="auto"
      >
        <Collapse isOpen={!project}>
          <Heading as="h2" fontSize="xl" mb="1" fontWeight="normal">
            Create a new project
          </Heading>
          <Text fontSize="sm" color="gray.600" mb={6}>
            A project collects analytics for a given website or webapp.
          </Text>
          <Divider />
          <NewProjectForm onSubmit={submit} />
        </Collapse>
        <Collapse isOpen={!!project}>
          <Heading as="h2" fontSize="xl" mb="1" fontWeight="normal">
            Project created !
          </Heading>
          <Text fontSize="sm" color="gray.600" mb={6}>
            Follow the instructions to get started :
          </Text>
          <Divider />
          <Text>Copy the following scripts into your webpage:</Text>
          <Text fontSize="sm" color="gray.600" fontStyle="italic" mb={4}>
            Tip: add them right before the closing{' '}
            <Box as="code" fontSize="xs" fontWeight="medium">
              &lt;/body&gt;
            </Box>{' '}
            tag.
          </Text>
          <Code as="pre" fontSize="xs" p={2} w="100%" overflowX="auto">
            {project &&
              `<script id="chiffre:analytics-config" type="application/json">
  {
    "publicKey": "${project.publicKey}",
    "pushURL":   "${process.env.PUSH_URL}/${project.id}"
  }
</script>
<script
  src="${process.env.CDN_URL}/analytics.js"
  crossorigin="anonymous"
  async=""
>
</script>
`}
          </Code>
          <Stack isInline spacing="2" mt={8}>
            <ButtonRouteLink
              to="/dashboard"
              variantColor="blue"
              type="submit"
              ml="auto"
            >
              Done
            </ButtonRouteLink>
          </Stack>
        </Collapse>
      </Box>
    </MainPage>
  )
}

export default NewPage
