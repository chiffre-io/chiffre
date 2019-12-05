import React from 'react'
import { Stack, Checkbox } from '@chakra-ui/core'
import useConsent from '~/src/client/hooks/useConsent'

const ConsentManager = ({}) => {
  const { events, isConsentingTo, isIndeterminate, setConsent } = useConsent()

  return (
    <Stack>
      {events.map(type => (
        <Checkbox
          key={type}
          isChecked={isConsentingTo(type)}
          isIndeterminate={isIndeterminate(type)}
          onChange={e => setConsent(type, e.target.checked)}
        >
          {type}
        </Checkbox>
      ))}
    </Stack>
  )
}

export default ConsentManager
