import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { AppProvider } from "@/contexts/AppContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CEO SYNC - Sistema de Gestão Corporativa",
  description: "Sistema completo de gestão corporativa com agenda, chat, tarefas e muito mais.",
  keywords: ["gestão corporativa", "agenda", "chat", "tarefas", "dashboard", "CEO SYNC"],
  authors: [{ name: "CSCRM AI" }],
  creator: "CSCRM AI",
  publisher: "CSCRM AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ceosync.vercel.app"),
  openGraph: {
    title: "CEO SYNC - Sistema de Gestão Corporativa",
    description: "Sistema completo de gestão corporativa com agenda, chat, tarefas e muito mais.",
    url: "https://ceosync.vercel.app",
    siteName: "CEO SYNC",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CEO SYNC - Sistema de Gestão Corporativa",
    description: "Sistema completo de gestão corporativa com agenda, chat, tarefas e muito mais.",
    creator: "@cscrmai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CEO SYNC" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AppProvider>
            <NotificationProvider>
              <ServiceWorkerRegistration />
              {children}
            </NotificationProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
