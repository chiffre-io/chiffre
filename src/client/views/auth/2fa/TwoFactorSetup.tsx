import React from 'react'
import axios from 'axios'
import {
  Button,
  Heading,
  List,
  ListItem,
  Text,
  Box,
  Flex
} from '@chakra-ui/core'
import useLoader from '~/src/client/hooks/useLoader'
import { getLoginCredentials } from '~/src/client/auth'
import { TwoFactorActivationResponse } from '~/pages/api/auth/2fa/activate'
import TwoFactorSecretDisplay from './components/TwoFactorSecretDisplay'

const useRequestActivation = () => {
  const { load, loading, data } = useLoader<TwoFactorActivationResponse>()

  const requestActivation = () =>
    load(async () => {
      const res = await axios.post('/api/auth/2fa/activate', null, {
        headers: {
          authorization: `Bearer ${getLoginCredentials()}`
        }
      })
      return res.data
    })

  return {
    requestActivation,
    loading,
    data
  }
}

// --

const Phase1 = ({ uri, text, onNext }) => {
  return (
    <Box w="100%" maxW="26.5em" p={2}>
      <Heading as="h3" size="lg" mb={4}>
        Enable Two-Factor Authentication :
      </Heading>
      <List as="ol" styleType="decimal" mb={4} spacing={2}>
        <ListItem>
          Open your authenticator app{' '}
          <Text fontSize="xs" color="gray.600" as="span">
            (eg: Google Authenticator, Authy, ...)
          </Text>
        </ListItem>
        <ListItem>Scan the QR code :</ListItem>
      </List>
      <TwoFactorSecretDisplay uri={uri} text={text} />
      <Flex>
        <Button variantColor="blue" mt={4} ml="auto" rightIcon="chevron-right">
          Next
        </Button>
      </Flex>
    </Box>
  )
}

const Phase2 = ({}) => {
  return null
}

// --

const TwoFactorSetup: React.FC = () => {
  // Phase 0: Only show button "Enable 2FA"
  // Phase 1: show QR code & text code
  // Phase 3: show input for 2FA token
  // Phase 4: show backup codes
  // Phase 5: done

  const {
    requestActivation,
    loading,
    data: phase1Data
  } = useRequestActivation()

  // const phase1Data = {
  //   twoFactorSecret: {
  //     text: 'LA27 JDYV BUOJ YBUI VNLD ENTN ZS4W TQM4',
  //     uri: 'bar'
  //   }
  // }

  return (
    <Flex align="center" direction="column">
      {!phase1Data && (
        <Button
          isLoading={loading}
          onClick={requestActivation}
          loadingText="Enabling Two-Factor Authentication"
          variantColor="green"
        >
          Enable Two-Factor Authentication
        </Button>
      )}
      {phase1Data && (
        <Phase1 {...phase1Data.twoFactorSecret} onNext={() => {}} />
      )}
      <Phase2 />
    </Flex>
  )
}

export default TwoFactorSetup
