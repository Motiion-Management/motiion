import './globals.css'
import { Montserrat } from 'next/font/google'
import type { Metadata, Viewport } from 'next'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap'
})

const APP_NAME = 'Motiion'
const APP_DEFAULT_TITLE = 'Motiion'
const APP_TITLE_TEMPLATE = '%s - Motiion'
const APP_DESCRIPTION =
  'The dance ecosystem in motion. Connect with dancers, choreographers, and agencies on the move.'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE
  },
  description: APP_DESCRIPTION,
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
  themeColor: '#FAFAFA'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        {children}
      </body>
    </html>
  )
}