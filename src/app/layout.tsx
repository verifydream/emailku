import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'emailku - Gmail Dot Trick Generator',
  description: 'Generate unlimited Gmail dot variations and track usage. The ultimate tool for creating multiple email aliases from a single Gmail account.',
  keywords: ['gmail', 'dot trick', 'email generator', 'gmail variations', 'email alias', 'productivity'],
  authors: [{ name: 'emailku' }],
  openGraph: {
    title: 'emailku - Gmail Dot Trick Generator',
    description: 'Generate unlimited Gmail dot variations and track usage.',
    type: 'website',
    locale: 'en_US',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
