import React from 'react'
import axios from 'axios'
import {
  Button,
  List,
  ListItem,
  Text,
  Box,
  Flex,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  Textarea
} from '@chakra-ui/core'
import useLoader from '~/src/client/hooks/useLoader'
import { getLoginCredentials } from '~/src/client/auth'
import { TwoFactorEnableResponse } from '~/pages/api/auth/2fa/enable'
import TwoFactorSecretDisplay from './TwoFactorSecretDisplay'
import ErrorText from '~/src/client/components/form/ErrorText'
import TwoFactorForm, { Values as TwoFactorFormValues } from '../TwoFactorForm'
import { VerifyTwoFactorParams } from '../../../../../pages/api/auth/2fa/verify'

const useRequestActivation = () => {
  type T = TwoFactorEnableResponse
  const { load, loading, data, error } = useLoader<T>()

  const requestActivation = () =>
    load(async () => {
      try {
        const res = await axios.post('/api/auth/2fa/enable', null, {
          headers: {
            authorization: `Bearer ${getLoginCredentials()}`
          }
        })
        return res.data
      } catch (error) {
        throw new Error(error.response.data.error)
      }
    })

  return {
    requestActivation,
    loading,
    error: error ? error.message || error : null,
    data: data ? data : null
  }
}

const useVerification = () => {
  type T = {
    backupCodes: string[]
  }
  const { load, loading, data, error } = useLoader<T>()

  const verifyToken = (token: string) =>
    load(async () => {
      const body: VerifyTwoFactorParams = {
        token
      }
      try {
        const res = await axios.post('/api/auth/2fa/verify', body, {
          headers: {
            authorization: `Bearer ${getLoginCredentials()}`
          }
        })
        return res.data
      } catch (error) {
        throw new Error(error.response.data.error)
      }
    })

  return {
    verifyToken,
    loading,
    error: error ? error.message || error : null,
    data: data ? data.backupCodes : null
  }
}

// --

const StatusPhase = ({ loading, onClick, error }) => {
  return (
    <>
      <Text mb={4}>
        Two-factor authentication is{' '}
        <Text as="span" fontWeight="semibold">
          disabled
        </Text>
        .
      </Text>
      <Box mb={8}>
        <Button
          isLoading={loading}
          onClick={onClick}
          variantColor="green"
          loadingText="Enable"
        >
          Enable
        </Button>
        <ErrorText bold mt={2}>
          {error}
        </ErrorText>
      </Box>
    </>
  )
}

const SecretAndVerificationPhase = ({
  uri,
  text,
  onNext,
  onCancel,
  loading,
  error
}) => {
  return (
    <>
      <List as="ol" styleType="decimal" mb={4} spacing={2}>
        <ListItem>
          Open your authenticator app{' '}
          <Text fontSize="xs" color="gray.600" as="span">
            (eg: Google Authenticator, Authy, ...)
          </Text>
        </ListItem>
        <ListItem>
          Scan the QR code :
          <TwoFactorSecretDisplay uri={uri} text={text} mt={8} />
        </ListItem>
        <ListItem mt={4}>
          Enter the code from your authenticator :
          <TwoFactorForm onSubmit={onNext} label={null}>
            {error && (
              <ErrorText bold textAlign="center" mt={-2}>
                {error}
              </ErrorText>
            )}
            <Flex justify="flex-end" mt={4}>
              <Button mr={2} variant="ghost" onClick={onCancel} type="button">
                Cancel
              </Button>
              <Button
                variantColor="blue"
                rightIcon="chevron-right"
                type="submit"
                isLoading={loading}
              >
                Next
              </Button>
            </Flex>
          </TwoFactorForm>
        </ListItem>
      </List>
    </>
  )
}

const BackupCodes = ({ backupCodes, onDone }) => {
  const ref = React.useRef<HTMLTextAreaElement>()
  return (
    <>
      <Alert
        status="success"
        variant="top-accent"
        flexDirection="column"
        justifyContent="center"
        textAlign="center"
        py={5}
        mb={6}
      >
        <AlertIcon size="40px" />
        <AlertTitle mt={4} mb={1} fontSize="lg" fontWeight="semibold">
          Two-factor authentication activated !
        </AlertTitle>
      </Alert>
      <Text mb={4}>
        In case you lose access to your authenticator, here are some backup
        codes that you should store safely :<br />
        <Text fontSize="sm" color="gray.600">
          (write them down or save them in a secure password manager)
        </Text>
      </Text>
      <Textarea
        isReadOnly
        ref={ref}
        onFocus={() => ref.current.select()}
        value={(backupCodes || []).join('\n')}
        lineHeight="2"
        fontFamily="mono"
        fontSize="0.9em"
        whiteSpace="pre"
        _readOnly={{
          backgroundColor: 'gray.100'
        }}
        minH="256px"
        isFullWidth
        variant="filled"
        resize="none"
      />
      <Flex justify="flex-end" mt={4}>
        <Button variantColor="green" leftIcon="check" onClick={onDone}>
          Done
        </Button>
      </Flex>
    </>
  )
}

// --

const TwoFactorSetup: React.FC = () => {
  // Phase 1: Only show button "Enable 2FA"
  // Phase 2: show QR code, text code & input for 2FA token
  // Phase 3: show backup codes

  const {
    requestActivation,
    loading: requestLoading,
    error: requestError,
    data: twoFactorSecret
  } = useRequestActivation()

  const {
    verifyToken,
    loading: verifyLoading,
    error: verifyError,
    data: backupCodes
  } = useVerification()

  const showStatus = !twoFactorSecret
  const showBackup = !!backupCodes
  const showSecret = twoFactorSecret && !showBackup

  const onCancel = async () => {
    await axios.delete('/api/auth/2fa/enable', {
      headers: {
        authorization: `Bearer ${getLoginCredentials()}`
      }
    })
    // todo: Close the component, reset state
  }

  return (
    <Box w="100%" maxW="26.5em" p={2}>
      {showStatus && (
        <StatusPhase
          onClick={requestActivation}
          loading={requestLoading}
          error={requestError}
        />
      )}
      {showSecret && (
        <SecretAndVerificationPhase
          {...twoFactorSecret}
          loading={verifyLoading}
          onNext={async (values: TwoFactorFormValues) => {
            await verifyToken(values.twoFactorToken)
          }}
          onCancel={onCancel}
          error={verifyError}
        />
      )}
      {showBackup && (
        <BackupCodes backupCodes={backupCodes} onDone={() => {}} />
      )}
    </Box>
  )
}

export default TwoFactorSetup
