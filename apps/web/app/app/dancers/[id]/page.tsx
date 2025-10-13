'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function DancerUniversalLink() {
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    if (!id) return

    const deepLink = `motiion://app/dancers/${id}`

    // Try to open the app immediately
    window.location.href = deepLink

    // Set a timeout to redirect to fallback if app doesn't open
    const fallbackTimer = setTimeout(() => {
      // Fallback: redirect to main website or show app store link
      window.location.href = 'https://motiion.framer.website/'
    }, 2500)

    // Clean up timer if component unmounts
    return () => clearTimeout(fallbackTimer)
  }, [id])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#003D37',
      color: 'white',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Opening Motiion...</h1>
      <p style={{ fontSize: '16px', opacity: 0.8 }}>
        If the app doesn't open automatically, make sure you have Motiion installed.
      </p>
    </div>
  )
}
