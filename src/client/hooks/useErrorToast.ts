import { useToast } from '@chakra-ui/core'

export default function useErrorToast() {
  const toast = useToast()

  return (error?: Error) => {
    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error)
      }
      toast({
        title: error.name,
        description: error.message,
        status: 'error',
        isClosable: true,
        position: 'bottom-right'
      })
    }
  }
}
