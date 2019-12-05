import getServerSideConfig from 'next/config'
import dotenv from 'dotenv'
import envAlias from 'env-alias'

// In a Next.js context, we can use the supplied serverRuntimeConfig object,
// configured in /next.config.js.
// However in some cases outside of Next (eg: running code in cron tasks)
// we may need to access the environment. We use to dotenv to load local
// .env scripts (not used in production) and fallback to the environment.
export default (() => {
  const nextConfig = getServerSideConfig()
  if (nextConfig) {
    return nextConfig.serverRuntimeConfig
  }
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
    envAlias()
  }

  return process.env
})()
