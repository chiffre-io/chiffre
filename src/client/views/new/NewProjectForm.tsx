import React from 'react'
import {
  Input,
  Button,
  useColorMode,
  Box,
  Stack,
  FormControl
} from '@chakra-ui/core'
import PasswordField from '~/src/client/components/form/PasswordField'
import Label, { LabelWithAside } from '~/src/client/components/form/Label'
import { RouteLink } from '~/src/client/components/Links'
import EmailField from '~/src/client/components/form/EmailField'
import { Formik, Form, FormikErrors } from 'formik'
import InputField from '../../components/form/InputField'
import FieldHelpText from '../../components/form/FieldHelpText'

export interface Values {
  name: string
  description?: string
  deploymentURL: string
}

export interface Props {
  onSubmit: (v: Values) => void
  onCancel: () => void
}

const NewProjectForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const dark = useColorMode().colorMode === 'dark'

  const initialValues: Values = {
    name: '',
    deploymentURL: ''
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={values => {
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
              <InputField name="name" />
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
              <Label htmlFor="url">Production URL</Label>
              <FieldHelpText id="production-url-help-text">
                The URL where your website or webapp can be accessed :
              </FieldHelpText>
              <Input name="url" aria-describedby="production-url-help-text" />
            </FormControl>
            <Stack isInline spacing="2" mt={8}>
              <Button
                variantColor="green"
                isLoading={isSubmitting}
                type="submit"
              >
                Create project
              </Button>
              <Button variant="ghost" type="button" onClick={onCancel}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}

export default NewProjectForm
