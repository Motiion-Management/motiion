'use client'

import { useEffect, useState } from 'react'
import PWAPrompt from 'react-ios-pwa-prompt'

export function InstallPWA() {
  const [isBrowser, setIsBrowser] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsBrowser(true)
    }
  }, [setIsBrowser])
  if (!isBrowser) return null
  return (
    <PWAPrompt
      promptOnVisit={1}
      timesToShow={5}
      appIconPath="/apple-touch-icon.png"
      copyTitle="Install the Motiion App"
      copySubtitle="motiion.io"
      copyDescription="This site is made to be used as an app. Get the full experience and stay connected with the dance ecosystem."
      delay={50}
    />
  )
}
