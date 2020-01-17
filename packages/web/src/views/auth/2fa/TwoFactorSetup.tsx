import React from 'react'
import {
  Button,
  List,
  ListItem,
  Text,
  Box,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  Textarea
} from '@chakra-ui/core'
import {
  TwoFactorStatus,
  TwoFactorEnableResponse,
  TwoFactorVerifyResponse
} from '@chiffre/api-types'
import { useChiffreClient } from '@chiffre/client-react'
import ErrorText from '../../../components/form/ErrorText'
import TwoFactorForm from '../TwoFactorForm'
import TwoFactorSecretDisplay from './TwoFactorSecretDisplay'

// --

function useLoader() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error>(null)

  const load = React.useCallback(async (action: () => Promise<any>) => {
    try {
      setLoading(true)
      await action()
      setError(null)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, load }
}

// --

interface PhaseProps {
  visible: boolean
}

interface StatusPhaseProps extends PhaseProps {
  statusText: string
  buttonText: string
  buttonColor: string
  action: () => Promise<any>
}

const StatusPhase: React.FC<StatusPhaseProps> = ({
  visible,
  statusText,
  buttonText,
  buttonColor,
  action
}) => {
  const { loading, error, load } = useLoader()
  if (!visible) {
    return null
  }
  return (
    <>
      <Text mb={4}>Two-factor authentication is {statusText}.</Text>
      <Box mb={8}>
        <Button
          isLoading={loading}
          onClick={() => load(action)}
          variantColor={buttonColor}
          loadingText={buttonText}
        >
          {buttonText}
        </Button>
        <ErrorText bold mt={2}>
          {error}
        </ErrorText>
      </Box>
    </>
  )
}

// -----------------------------------------------------------------------------

interface VerifyPhaseProps extends PhaseProps {
  text?: string | React.ReactElement
  cancel: () => Promise<any>
  verify: (token: string) => Promise<any>
}

const VerifyPhase: React.FC<VerifyPhaseProps> = ({
  text = 'Enter the code from your authenticator :',
  visible,
  cancel,
  verify
}) => {
  const {
    loading: cancelLoading,
    error: cancelError,
    load: cancelLoad
  } = useLoader()
  const { loading: nextLoading, error: nextError, load: nextLoad } = useLoader()
  if (!visible && !(nextLoading || cancelLoading)) {
    return null
  }
  return (
    <>
      {text}
      <TwoFactorForm
        onSubmit={values => {
          nextLoad(() => verify(values.twoFactorToken))
        }}
        label={null}
      >
        {(cancelError || nextError) && (
          <ErrorText bold textAlign="center" mt={-2}>
            {cancelError} {nextError}
          </ErrorText>
        )}
        <Flex justify="flex-end" mt={4}>
          <Button
            mr={2}
            variant="ghost"
            onClick={() => cancelLoad(cancel)}
            type="button"
            isLoading={cancelLoading}
          >
            Cancel
          </Button>
          <Button
            variantColor="blue"
            rightIcon="chevron-right"
            type="submit"
            isLoading={nextLoading}
          >
            Next
          </Button>
        </Flex>
      </TwoFactorForm>
    </>
  )
}

// -----------------------------------------------------------------------------

interface TotpSecretPhaseProps extends VerifyPhaseProps {
  secret: TwoFactorEnableResponse
}

const TotpSecretPhase: React.FC<TotpSecretPhaseProps> = ({
  visible,
  secret,
  cancel,
  verify
}) => {
  if (!visible) {
    return null
  }
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
          <TwoFactorSecretDisplay uri={secret.uri} text={secret.text} mt={8} />
        </ListItem>
        <ListItem mt={4}>
          <VerifyPhase cancel={cancel} verify={verify} visible />
        </ListItem>
      </List>
    </>
  )
}

// -----------------------------------------------------------------------------

interface BackupCodesPhaseProps extends TwoFactorVerifyResponse, PhaseProps {
  next: () => void
}

const BackupCodesPhase: React.FC<BackupCodesPhaseProps> = ({
  visible,
  backupCodes,
  next
}) => {
  const ref = React.useRef<HTMLTextAreaElement>()
  if (!visible) {
    return null
  }
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
        <Text fontSize="sm" color="gray.600" as="span">
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
        <Button variantColor="green" leftIcon="check" onClick={next}>
          Done
        </Button>
      </Flex>
    </>
  )
}

// --

const TwoFactorSetup: React.FC = () => {
  const client = useChiffreClient()
  const status = client.settings.twoFactor.status
  const [secret, setSecret] = React.useState<TwoFactorEnableResponse>(null)
  const [backup, setBackup] = React.useState<TwoFactorVerifyResponse>(null)
  const [confirmDisable, setConfirmDisable] = React.useState(false)

  return (
    <>
      <StatusPhase
        visible={status === TwoFactorStatus.disabled}
        statusText="disabled"
        buttonText="Enable"
        buttonColor="green"
        action={() => client.settings.twoFactor.enable().then(setSecret)}
      />
      <StatusPhase
        visible={
          status === TwoFactorStatus.verified && !backup && !confirmDisable
        }
        statusText="enabled"
        buttonText="Disable"
        buttonColor="red"
        action={() => {
          setConfirmDisable(true)
          return Promise.resolve()
        }}
      />
      <TotpSecretPhase
        visible={status === TwoFactorStatus.enabled && !!secret}
        secret={secret}
        cancel={() =>
          client.settings.twoFactor.cancel().then(() => setSecret(null))
        }
        verify={token =>
          client.settings.twoFactor.verify(token).then(setBackup)
        }
      />
      <BackupCodesPhase
        visible={status === TwoFactorStatus.verified && !!backup}
        backupCodes={backup?.backupCodes}
        next={() => setBackup(null)}
      />
      <VerifyPhase
        text={
          <>
            <Text>Two factor authentication is not fully active yet.</Text>
            <Text>
              Confirm 2FA activation with a code from your authenticator :
            </Text>
          </>
        }
        visible={status === TwoFactorStatus.enabled && !secret}
        cancel={() =>
          client.settings.twoFactor.cancel().then(() => {
            setSecret(null)
            setBackup(null)
          })
        }
        verify={token =>
          client.settings.twoFactor.verify(token).then(setBackup)
        }
      />
      <VerifyPhase
        text="To disable 2FA, please enter a code from your authenticator:"
        visible={status === TwoFactorStatus.verified && confirmDisable}
        cancel={() => {
          setConfirmDisable(false)
          return Promise.resolve()
        }}
        verify={token =>
          client.settings.twoFactor
            .disable(token)
            .then(() => setConfirmDisable(false))
        }
      />
    </>
  )
}

export default TwoFactorSetup
