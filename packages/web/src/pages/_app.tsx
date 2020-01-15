import React from 'react'
import App from 'next/app'
import Head from 'next/head'
import {
  ThemeProvider,
  CSSReset,
  ColorModeProvider,
  DarkMode
} from '@chakra-ui/core'
import theme from '../ui/theme'
import { Global, css } from '@emotion/core'
import { ChiffreClientProvider } from '@chiffre/client-react'

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

class MyApp extends App {
  // Only uncomment this method if you have blocking data requirements for
  // every single page in your application. This disables the ability to
  // perform automatic static optimization, causing every page in your app to
  // be server-side rendered.
  //
  // static async getInitialProps(appContext) {
  //   // calls page's `getInitialProps` and fills `appProps.pageProps`
  //   const appProps = await App.getInitialProps(appContext);
  //
  //   return { ...appProps }
  // }

  render() {
    const { Component, pageProps } = this.props
    return (
      <ThemeProvider theme={theme}>
        {/* <ColorModeProvider> */}
        {/* <DarkMode> */}
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

        <ChiffreClientProvider apiURL={process.env.API_URL}>
          <Component {...pageProps} />
        </ChiffreClientProvider>
        {/* </DarkMode> */}
        {/* </ColorModeProvider> */}
      </ThemeProvider>
    )
  }
}

export default MyApp
