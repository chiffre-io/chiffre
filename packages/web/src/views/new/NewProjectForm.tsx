import React from 'react'
import { Button, Box, Stack, FormControl } from '@chakra-ui/core'
import { Formik, Form, FormikErrors } from 'formik'
import Label, { LabelWithAside } from '../../components/form/Label'
import InputField from '../../components/form/InputField'
import FieldHelpText from '../../components/form/FieldHelpText'

export interface Values {
  name: string
  description?: string
  deploymentURL: string
}

export interface Props {
  onSubmit: (v: Values) => void
}

const NewProjectForm: React.FC<Props> = ({ onSubmit }) => {
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
                The URL where your website or webapp can be accessed :
              </FieldHelpText>
              <InputField
                name="deploymentURL"
                aria-describedby="deployment-url-help-text"
                placeholder="eg: example.com, blog.my-domain.io"
              />
            </FormControl>
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
