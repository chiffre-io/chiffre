import { useRouter } from 'next/router'

export function useRedirectToLoginUrl() {
  const router = useRouter()
  if (!router) {
    return '/login'
  }
  const url = router.asPath.replace('/login?redirect=', '')
  return `/login?redirect=${url}`
}

export default function useRedirectToLogin(redirectUrl?: string) {
  const router = useRouter()
  return async () => {
    const url = (redirectUrl || router.asPath).replace('/login?redirect=', '')
    await router.push(`/login?redirect=${url}`)
  }
}
