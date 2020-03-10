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
import NewProjectForm, { Values, VaultInfo } from '../views/new/NewProjectForm'
import MainPage from '../layouts/MainPage'
import { ButtonRouteLink } from '../components/primitives/Links'
import Title from '../components/head/Title'

const NewPage: NextPage = () => {
  const client = useChiffreClient()
  const [project, setProject] = React.useState<Project>(null)

  const availableVaults: VaultInfo[] = React.useMemo(() => {
    return Array.from(new Set(client.projects.map(p => p.vaultID))).map(
      vaultID => ({
        id: vaultID,
        name: `${vaultID.slice(0, 4)} - ${client.projects
          .filter(p => p.vaultID === vaultID)
          .map(p => p.name)
          .join(', ')}`
      })
    )
  }, [client.projects])

  const submit = async (values: Values) => {
    const project = await client.createProject({
      name: values.name,
      description: values.description,
      url: values.deploymentURL,
      vaultID: values.vaultID || undefined
    })
    setProject(project)
  }

  return (
    <>
      <Title>New Project</Title>
      <MainPage>
        <Box
          maxW="xl"
          mt={8}
          mx="auto"
          backgroundColor="white"
          p={4}
          shadow="md"
          borderRadius={4}
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
            <NewProjectForm onSubmit={submit} vaults={availableVaults} />
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
    </>
  )
}

export default NewPage
