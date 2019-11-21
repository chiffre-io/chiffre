import React from 'react'

export type ConsentMap = {
  [key: string]: boolean
}

const load = (): ConsentMap => {
  if (typeof window === 'undefined') {
    return {}
  }
  const json = window.localStorage.getItem('consent-storage')
  if (!json) {
    return {}
  }
  try {
    return JSON.parse(json)
  } catch (error) {
    return {}
  }
}

const save = (map: ConsentMap) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem('consent-storage', JSON.stringify(map))
}

// --

export default function useConsent() {
  const [state, setState] = React.useState<ConsentMap>(load)

  React.useEffect(() => {
    save(state)
  }, [state])

  const registerConsentableEvent = (type: string) => {
    setState(state => ({
      ...state,
      [type]: state[type] === undefined ? null : state[type]
    }))
  }

  const setConsent = (type: string, consent: boolean) => {
    setState(state => ({
      ...state,
      [type]: consent
    }))
  }

  const consentToAll = () => {
    setState(state =>
      Object.keys(state).reduce((obj, key) => ({ ...obj, [key]: true }), {})
    )
  }

  const consentToNone = () => {
    setState(state =>
      Object.keys(state).reduce((obj, key) => ({ ...obj, [key]: true }), {})
    )
  }

  const events = Object.keys(state)
  const isConsentingTo = (type: string): boolean => state[type] !== false
  const isIndeterminate = (type: string): boolean => state[type] === null

  return {
    registerConsentableEvent,
    events,
    setConsent,
    isConsentingTo,
    isIndeterminate,
    consentToAll,
    consentToNone
  }
}
