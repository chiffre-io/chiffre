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
          <script
            src="http://localhost:3000/api/embed/c0ffeeb0-dead-f00d-baad-cafebaadcafe"
            integrity="sha256-Id1GLxztN6F0t+/AtVRJshWXXIz6pz/SFxB6mRgfS3Q="
            crossOrigin="anonymous"
            async
          />
        </body>
      </Html>
    )
  }
}

export default MyDocument