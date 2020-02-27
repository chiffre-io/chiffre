import React from 'react'
import Body from '../components/primitives/Body'
import Header, { HeaderProps } from '../components/Header'

export interface MainPageProps {
  headerProps?: HeaderProps
}

const MainPage: React.FC<MainPageProps> = ({ headerProps, children }) => {
  return (
    <>
      <Body shade={200} />
      <Header {...headerProps} />
      {children}
    </>
  )
}

export default MainPage
