// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

// ./pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          {process.env.NODE_ENV === 'production' && (
            <script
              src={`${process.env.APP_URL}/api/embed/testProjectID123`}
              integrity="sha256-0XYtrQ35XAgpiEpQDV4jSmrm9l0ZoczWyLjlHZsATbI="
              crossOrigin="anonymous"
              async
            ></script>
          )}
        </body>
      </Html>
    )
  }
}

export default MyDocument
