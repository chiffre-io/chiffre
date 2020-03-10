import Head from 'next/head'

const Title: React.FC = ({ children }) => {
  return (
    <Head>
      <title>{children} | Chiffre.io</title>
    </Head>
  )
}

export default Title
