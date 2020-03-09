import React from 'react'

export interface ClientOnlyProps {
  skeleton?: JSX.Element
}

const ClientOnly: React.FC<ClientOnlyProps> = ({
  children,
  skeleton = null
}) => {
  const [reRendered, setReRendered] = React.useState(false)
  React.useEffect(() => {
    setReRendered(true)
  }, [])
  return <>{reRendered ? children : skeleton}</>
}

export default ClientOnly
