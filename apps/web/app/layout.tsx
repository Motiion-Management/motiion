import type { Metadata, Viewport } from 'next'

import { Manrope } from 'next/font/google'
import './globals.css'
import ConvexClientProvider from './ConvexClientProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const manrope = Manrope({ subsets: ['latin'] })

const APP_NAME = 'Motiion'
const APP_DEFAULT_TITLE = 'Motiion'
const APP_TITLE_TEMPLATE = '%s - Motiion'
const APP_DESCRIPTION = 'The dance ecosystem in motiion.'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  }
}

export const viewport: Viewport = {
  themeColor: '#00CCB7'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
