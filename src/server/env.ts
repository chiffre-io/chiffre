import getServerSideConfig from 'next/config'
import dotenv from 'dotenv'

// In a Next.js context, we can use the supplied serverRuntimeConfig object,
// configured in /next.config.js.
// However in some cases outside of Next (running code in cron tasks)
// we may need to access the environment, and we use to dotenv to load local
// .env scripts (don't use those in production) and fallback to the environment.
export default (() => {
  const nextConfig = getServerSideConfig()
  if (nextConfig) {
    return nextConfig.serverRuntimeConfig
  }
  dotenv.config()

  return process.env
})()
