export enum ConsentPolicies {
  optIn = 'opt-in', // Default: not collected, can opt-in to collection
  optOut = 'opt-out' // Default: collected, can opt-out of collection
}

function isCollectedByDefault(policy: ConsentPolicies): boolean {
  switch (policy) {
    case ConsentPolicies.optIn:
      return false
    case ConsentPolicies.optOut:
      return true
  }
}

export type ConsentPolicyMap<T> = {
  [key in keyof T]: ConsentPolicies
}

export type ConsentState<T> = {
  readonly [key in keyof T]: boolean
}

export function buildConsentState<T>(policies: ConsentPolicyMap<T>) {
  const keys = Object.keys(policies) as (keyof ConsentPolicyMap<T>)[]
  return Object.seal(
    keys.reduce(
      (obj, key) => ({
        ...obj,
        key: isCollectedByDefault(policies[key])
      }),
      {}
    )
  ) as ConsentState<T>
}

export function authorizeConsent<T>(
  key: keyof T,
  state: ConsentState<T>
): ConsentState<T> {
  return Object.seal({
    ...state,
    [key]: true
  })
}

export function widthdrawConsent<T>(
  key: keyof T,
  state: ConsentState<T>
): ConsentState<T> {
  return Object.seal({
    ...state,
    [key]: false
  })
}
