import React from 'react'

type Loader<T> = () => T | Promise<T>

export default function useLoader<T>({ showSpinnerAfter = 500 } = {}) {
  const [data, setData] = React.useState<T>()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [showSpinner, setShowSpinner] = React.useState(false)

  const load = async (loader: Loader<T>) => {
    let timeout
    try {
      setLoading(true)
      timeout = setTimeout(() => {
        setShowSpinner(true)
      }, showSpinnerAfter)
      const res = await loader()
      setData(res)
      setError(null)
    } catch (error) {
      console.error(error)
      setData(null)
      setError(error)
    } finally {
      clearTimeout(timeout)
      setShowSpinner(false)
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    showSpinner,
    error,
    load
  }
}
