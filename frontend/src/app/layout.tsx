import "@/app/globals.css"
import { Inter as FontSans } from "next/font/google"
import { Metadata } from "next"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import { viewport } from "./viewport"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export { viewport }

export const metadata: Metadata = {
  metadataBase: new URL("https://crisis-cap.fr"),
  title: {
    default: "Crisis CAP - Gestion de Crise Intelligente",
    template: "%s | Crisis CAP",
  },
  description:
    "Plateforme de gestion de crise intelligente pour les services d'urgence et de secours.",
  keywords: [
    "gestion de crise",
    "urgence",
    "secours",
    "pompiers",
    "intervention",
    "sécurité",
  ],
  authors: [
    {
      name: "Crisis CAP Team",
    },
  ],
  creator: "Crisis CAP Team",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://crisis-cap.fr",
    title: "Crisis CAP - Gestion de Crise Intelligente",
    description: "Plateforme de gestion de crise intelligente pour les services d'urgence et de secours.",
    siteName: "Crisis CAP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crisis CAP - Gestion de Crise Intelligente",
    description: "Plateforme de gestion de crise intelligente pour les services d'urgence et de secours.",
    creator: "@CrisisCAP",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
