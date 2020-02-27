// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

// ./pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document'
import Favicons from '../components/head/Favicons'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <Favicons />
        </Head>
        <body>
          <Main />
          <NextScript />
          {process.env.NODE_ENV === 'production' && (
            <>
              <script
                id="chiffre:analytics-config"
                type="application/json"
                dangerouslySetInnerHTML={{
                  __html: `{
                "publicKey": "pk.YAhelf4akcAuwNaJlLcnDOOVCf4Sg9rb4hF7eGpE7QA",
                "pushURL": "https://push.chiffre.io/YhxIkmw8RaUP6fOJ"
              }
              `
                }}
              />
              <script
                src="https://embed.chiffre.io/analytics.js"
                async
              ></script>
            </>
          )}
        </body>
      </Html>
    )
  }
}

export default MyDocument
