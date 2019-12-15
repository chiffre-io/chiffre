import { useRouter } from 'next/dist/client/router'

export default function useRedirectToLogin() {
  const router = useRouter()
  return async () => {
    const redirectUrl = router.asPath
    await router.push(`/login?redirect=${redirectUrl}`)
  }
}
