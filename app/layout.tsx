import type { Metadata } from "next"
import { Inter, Zen_Dots } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const zenDots = Zen_Dots({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-zen-dots"
})

export const metadata: Metadata = {
  title: "KIK DRM - designer techno",
  description: "Upload any image to create your own designer kick drum with AI-powered synthesis",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/favicon-196x196.png', sizes: '196x196', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-touch-icon-60x60.png', sizes: '60x60' },
      { url: '/apple-touch-icon-72x72.png', sizes: '72x72' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon.svg', color: '#00ff88' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IMG → KIK',
  },
  openGraph: {
    title: 'IMG → KIK - AI-Powered Kick Drum Synthesis',
    description: 'Upload any image to create your own designer kick drum with AI-powered synthesis',
    type: 'website',
    locale: 'en_US',
    url: 'https://kikdrm.vercel.app',
    siteName: 'IMG → KIK',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IMG → KIK - AI-Powered Kick Drum Synthesis',
    description: 'Upload any image to create your own designer kick drum with AI-powered synthesis',
  },
  other: {
    'msapplication-TileColor': '#000000',
    'msapplication-TileImage': '/mstile-144x144.png',
    'msapplication-square70x70logo': '/mstile-70x70.png',
    'msapplication-square150x150logo': '/mstile-150x150.png',
    'msapplication-wide310x150logo': '/mstile-310x150.png',
    'msapplication-square310x310logo': '/mstile-310x310.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${zenDots.variable}`} suppressHydrationWarning>{children}</body>
    </html>
  )
}