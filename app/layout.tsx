import type React from "react"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import ClientRootLayout from "./ClientRootLayout"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { fontSans } from "@/lib/fonts"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lovegirl.ai - AI Character Explorer",
  description: "Explore and chat with AI characters on Lovegirl.ai",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23a55ebf'/%3E%3Ctext x='50' y='35' fontFamily='Arial,sans-serif' fontSize='12' fontWeight='bold' textAnchor='middle' fill='white'%3ELovegirl%3C/text%3E%3Ctext x='50' y='65' fontFamily='Arial,sans-serif' fontSize='12' fontWeight='bold' textAnchor='middle' fill='white'%3Eai%3C/text%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
      {
        url: "/favicon.ico",
        sizes: "32x32",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased flex flex-col", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ClientRootLayout>
            <div className="flex-1 flex flex-col">{children}</div>
            <MobileNav />
          </ClientRootLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'