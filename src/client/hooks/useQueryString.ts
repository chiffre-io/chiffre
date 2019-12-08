import { useRouter } from 'next/dist/client/router'

export default function useQueryString(key: string): string {
  const router = useRouter()
  if (!router || !router.query) {
    // Router object is not available in an SSR context
    return null
  }
  const value = router.query[key]
  if (!value) {
    return null
  }
  return typeof value === 'string' ? value : value[0]
}

export const useMultipleQueryString = (key: string): string[] => {
  const router = useRouter()
  if (!router || !router.query) {
    // Router object is not available in an SSR context
    return null
  }
  const value = router.query[key]
  if (!value) {
    return null
  }
  return typeof value === 'string' ? [value] : value
}
