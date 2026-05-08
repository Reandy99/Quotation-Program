import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/shared/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FrameFlow",
  description: "Quotation management for creative professionals",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "FrameFlow",
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  themeColor: "#1C1714",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
