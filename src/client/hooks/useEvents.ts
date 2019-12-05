import React from 'react'
import { pushDataPoint, VisitorConfig } from '~/src/client/engine/visitor'
import useConsent from './useConsent'

export default function useEvent(type: string, config: VisitorConfig) {
  const { registerConsentableEvent, isConsentingTo } = useConsent()

  React.useEffect(() => {
    registerConsentableEvent(type)
  }, [])

  return (data: any = null) => {
    if (isConsentingTo(type) === false) {
      return
    }

    const payload =
      data !== null && data !== undefined
        ? {
            payload: data
          }
        : {}
    pushDataPoint(
      {
        type,
        ...payload
      },
      config
    )
  }
}
