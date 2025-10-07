import type React from "react"
import type { Metadata } from "next"

import "./globals.css"
import { Providers } from "@/lib/providers"
import { DashboardBackground } from "@/components/dashboard-background"

import { Open_Sans, Figtree, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _geist = V0_Font_Geist({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"] })

const openSans = Open_Sans({
  variable: "--font-family-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
})

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Assist Template",
  description: "Starter dashboard for AI chat prototypes.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${figtree.variable} antialiased`}>
        <DashboardBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
