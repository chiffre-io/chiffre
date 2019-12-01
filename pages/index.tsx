import { NextPage } from 'next'
import Redirect from '~/src/client/components/Redirect'

const Home: NextPage = () => {
  return <Redirect to="/login" />
}

export default Home
