import type React from "react"
import type { Metadata } from "next"
import { Sarabun } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
})

export const metadata: Metadata = {
  title: "Time Bank - Admin Panel",
  description: "ระบบจัดการ Time Bank",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
