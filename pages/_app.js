import '@/styles/globals.css'
import '@/styles/intro.css'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const LoadingScreen = dynamic(() => import('@/components/LoadingScreen'), {
  ssr: false
})

export default function App({ Component, pageProps }) {
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    setShowLoading(true)
    
    // Hide loading screen after 4.5 seconds (animation completes at 4s)
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 4500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showLoading && <LoadingScreen />}
      <Component {...pageProps} />
    </>
  )
}
