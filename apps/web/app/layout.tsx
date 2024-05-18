import './globals.css'
import { Montserrat } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'

import ConvexClientProvider from './ConvexClientProvider'
import { ThemeProvider } from './theme-provider'
import { splashTags } from './splash-page-tags'
import { RefreshPWA } from './refresh-pwa'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap'
})

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
    statusBarStyle: 'black',
    title: APP_DEFAULT_TITLE,
    startupImage: splashTags
  },
  formatDetection: {
    telephone: true
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
    <html lang="en" suppressHydrationWarning>
      <body className={montserrat.className}>
        <ConvexClientProvider>
          <ThemeProvider> {children}</ThemeProvider>
        </ConvexClientProvider>
        <RefreshPWA />
        <SpeedInsights />
        <Analytics />
        <Toaster richColors />
      </body>
    </html>
  )
}
