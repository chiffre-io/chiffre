import React from 'react'
import { useToast, IToast } from '@chakra-ui/core'

export interface Props extends IToast {
  show: boolean
}

const Toaster: React.FC<Props> = ({ show, ...props }) => {
  const toast = useToast()

  React.useEffect(() => {
    if (show) {
      toast(props)
    }
  }, [show])

  return null
}

export default Toaster
