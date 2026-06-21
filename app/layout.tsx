import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { Header } from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const GTAG_ID = 'AW-18174652706'

// Tipografia (3 papéis): display grotesk, corpo Plex Sans, assinatura Plex Mono.
const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['600', '700'], display: 'swap', variable: '--font-display' })
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-sans' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap', variable: '--font-mono' })

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
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="bg-background font-sans text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          {children}
        </ThemeProvider>

        {/* Google tag (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GTAG_ID}');
          `}
        </Script>
      </body>
    </html>
  )
}
