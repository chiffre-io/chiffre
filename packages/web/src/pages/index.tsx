import { NextPage } from 'next'
import Redirect from '../components/Redirect'

const Home: NextPage = () => {
  return <Redirect to="/signup" />
}

export default Home
