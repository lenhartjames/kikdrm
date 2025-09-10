import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KickMatch - AI-Powered Kick Drum Matcher",
  description: "Upload an image and get the perfect kick drum sample matched to its visual characteristics",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  )
}