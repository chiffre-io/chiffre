import React from 'react'
import { Button, Box, Stack, FormControl, Select } from '@chakra-ui/core'
import { Formik, Form, FormikErrors, Field } from 'formik'
import Label, { LabelWithAside } from '../../components/form/Label'
import InputField from '../../components/form/InputField'
import FieldHelpText from '../../components/form/FieldHelpText'

export interface Values {
  name: string
  description?: string
  deploymentURL: string
  vaultID?: string
}

export interface VaultInfo {
  id: string
  name: string
}

export interface Props {
  vaults: VaultInfo[]
  onSubmit: (v: Values) => void
}

const NewProjectForm: React.FC<Props> = ({ vaults, onSubmit }) => {
  const initialValues: Values = {
    name: '',
    description: '',
    deploymentURL: ''
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={_ => {
        const errors: FormikErrors<Values> = {}
        // todo: Add validation
        return errors
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Stack spacing={4}>
            <FormControl isRequired>
              <Label htmlFor="name">Name</Label>
              <InputField
                name="name"
                placeholder="Name of your website or webapp"
              />
            </FormControl>
            <Box>
              <LabelWithAside
                asideLeft
                htmlFor="description"
                aside={() => '(optional)'}
              >
                Description
              </LabelWithAside>
              <InputField name="description" />
            </Box>
            <FormControl isRequired>
              <Label htmlFor="url">Deployment URL</Label>
              <FieldHelpText id="deployment-url-help-text">
                The URL where your website or webapp can be accessed:
              </FieldHelpText>
              <InputField
                name="deploymentURL"
                aria-describedby="deployment-url-help-text"
                placeholder="eg: https://example.com, https://blog.mydomain.io"
              />
            </FormControl>
            <Box>
              <Label htmlFor="vaultID">Vault ID</Label>
              <FieldHelpText id="vault-id-help-text">
                Vaults let you share projects between teams
              </FieldHelpText>
              <Field name="vaultID">
                {({ field }) => (
                  <Select aria-describedby="vault-id-help-text" {...field}>
                    <>
                      <option value="">Create new vault</option>
                      {vaults.map(vault => (
                        <option key={vault.id} value={vault.id}>
                          {vault.name}
                        </option>
                      ))}
                    </>
                  </Select>
                )}
              </Field>
            </Box>
            <Stack isInline spacing="2" mt={8}>
              <Button
                variantColor="green"
                isLoading={isSubmitting}
                type="submit"
              >
                Create project
              </Button>
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}

export default NewProjectForm
