import React from 'react'

import { useRouter } from 'next/dist/client/router'

export interface Props {
  to: string
  as?: string
  replace?: boolean
}

const Redirect: React.FC<Props> = ({ to, as, replace = false }) => {
  const router = useRouter()

  React.useEffect(() => {
    if (replace) {
      router.replace(to, as)
    } else {
      router.push(to, as)
    }
  }, [])

  return null
}

export default Redirect
