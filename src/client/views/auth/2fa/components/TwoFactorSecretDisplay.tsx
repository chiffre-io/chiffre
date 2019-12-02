import React from 'react'
import { QRCode } from 'react-qr-svg'
import {
  Stack,
  Text,
  Box,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Tooltip,
  StackProps
} from '@chakra-ui/core'
import { useCopyToClipboard } from 'react-use'

export interface Props {
  uri: string
  text: string
}

function useTrigger(timeout: number): [boolean, () => void] {
  const [state, setState] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => {
      setState(false)
    }, timeout)
    return () => clearTimeout(t)
  }, [state])
  return [state, () => setState(true)]
}

const TwoFactorSecretDisplay: React.FC<Props & StackProps> = ({
  uri,
  text,
  ...props
}) => {
  const ref = React.createRef<HTMLInputElement>()
  const [_, copyToClipboard] = useCopyToClipboard()
  const [showCopied, triggerShowCopied] = useTrigger(1500)

  return (
    <Stack spacing={8} alignItems="center" {...props}>
      <Box mx={4}>
        <QRCode
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="Q"
          style={{ maxWidth: 256, maxHeight: 256 }}
          value={uri}
        />
      </Box>
      <Box textAlign="center" w="100%">
        <Text fontSize="sm" color="gray.600">
          Or paste this code in your authenticator app :
        </Text>
        <InputGroup size="md">
          <Input
            ref={ref}
            pr="4.5rem"
            type="text"
            value={text}
            isReadOnly
            fontWeight="semibold"
            onFocus={() => ref.current.select()}
            variant="unstyled"
          />
          <InputRightElement width="4.5rem">
            <Tooltip
              isOpen={showCopied}
              label="Copied !"
              aria-label="Copied !"
              placement="right-end"
            >
              <Button
                h="1.75rem"
                size="sm"
                onClick={() => {
                  triggerShowCopied()
                  copyToClipboard(text)
                }}
              >
                Copy
              </Button>
            </Tooltip>
          </InputRightElement>
        </InputGroup>
      </Box>
    </Stack>
  )
}

export default TwoFactorSecretDisplay
