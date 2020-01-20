import { useRouter } from 'next/dist/client/router'

export default function useRedirectToLogin(redirectUrl?: string) {
  const router = useRouter()
  return async () => {
    const url = (redirectUrl || router.asPath).replace('/login?redirect=', '')
    await router.push(`/login?redirect=${url}`)
  }
}
