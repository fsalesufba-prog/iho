<<<<<<< HEAD
import type { Metadata, Viewport } from 'next'
=======
import type { Metadata } from "next"
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ThemeScript } from '@/components/theme/ThemeScript'
import { cn } from '@/lib/utils'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

<<<<<<< HEAD
export const viewport: Viewport = {
=======
// @ts-ignore - viewport is a Next.js 14 export; in 13 this is safely ignored
export const viewport = {
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0284c7' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'IHO - Índice de Saúde Operacional',
    template: '%s | IHO',
  },
  description: 'Sistema completo para gestão de equipamentos e índice de saúde operacional. Monitore, controle e otimize sua frota com inteligência e precisão.',
  keywords: ['gestão de equipamentos', 'índice de saúde operacional', 'manutenção', 'frota', 'indicadores'],
  authors: [{ name: 'SQ Tecnologia da Informação' }],
  creator: 'SQ Tecnologia da Informação',
  publisher: 'IHO',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'IHO - Índice de Saúde Operacional',
    description: 'Transforme a gestão da sua frota com dados precisos e indicadores inteligentes',
    url: 'https://iho.sqtecnologiadainformacao.com',
    siteName: 'IHO',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IHO - Índice de Saúde Operacional',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IHO - Índice de Saúde Operacional',
    description: 'Transforme a gestão da sua frota com dados precisos e indicadores inteligentes',
    images: ['/og-image.jpg'],
    creator: '@iho',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="pt-BR" 
      className={cn(
        inter.variable, 
        poppins.variable,
        'scroll-smooth'
      )}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            {/* Gradiente de fundo animado */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse" />
              <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl animate-pulse delay-700" />
            </div>
            
            {/* Conteúdo principal */}
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}