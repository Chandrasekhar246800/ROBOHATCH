import '@/styles/globals.css'
import { useEffect, useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 4500) // 4s loading + 0.5s fade out

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {loading && <LoadingScreen />}
      <Component {...pageProps} />
    </>
  )
}
