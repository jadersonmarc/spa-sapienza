import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Header } from '@/components/header'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const SITE_TITLE = 'Sapienza Labs | Product Studio de Inteligência Tecnológica'
const SITE_DESCRIPTION = 'Especialistas em desenvolvimento de software, automações inteligentes e soluções RegTech sob medida. Transformamos complexidade técnica em ativos digitais de alto valor.'

export const metadata: Metadata = {
  metadataBase: new URL('https://sapienzalabs.com.br'),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Sapienza Labs',
    url: 'https://sapienzalabs.com.br',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: { url: '/apple-icon.png', sizes: '180x180' },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className="font-sans antialiased">
        <Header />
        {children}
      </body>
    </html>
  )
}
