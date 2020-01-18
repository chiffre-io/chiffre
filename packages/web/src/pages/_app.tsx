import React from 'react'
import App from 'next/app'
import Head from 'next/head'
import { ThemeProvider, CSSReset } from '@chakra-ui/core'
import theme from '../ui/theme'
import { Global, css } from '@emotion/core'
import { ChiffreClientProvider } from '../hooks/useChiffreClient'
import useRedirectToLogin from '../hooks/useRedirectToLogin'

const globalCss = css`
  html {
    font-family: ${theme.fonts['body']};
  }
`

const globalConfig = (theme: any) => ({
  light: {
    color: theme.colors.gray[700],
    bg: undefined,
    borderColor: theme.colors.gray[400],
    placeholderColor: theme.colors.gray[600]
  },
  dark: {
    color: theme.colors.gray[400],
    bg: theme.colors.gray[800],
    borderColor: theme.colors.whiteAlpha[300],
    placeholderColor: theme.colors.gray[600]
  }
})

const ChiffreContext: React.FC = ({ children }) => {
  const redirectToLogin = useRedirectToLogin()
  return (
    <ChiffreClientProvider
      apiURL={process.env.API_URL}
      onLocked={redirectToLogin}
    >
      {children}
    </ChiffreClientProvider>
  )
}

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <ThemeProvider theme={theme}>
        <Head>
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com/"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,300i,400,400i,600,600i,700,700i|Source+Code+Pro:400,500&display=swap"
            rel="stylesheet"
          />
        </Head>
        <CSSReset config={globalConfig} />
        <Global styles={[globalCss]} />
        <ChiffreContext>
          <Component {...pageProps} />
        </ChiffreContext>
      </ThemeProvider>
    )
  }
}

export default MyApp
