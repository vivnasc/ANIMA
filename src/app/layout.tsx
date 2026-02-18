import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ANIMA - Journey of Self-Discovery",
  description: "Structured self-discovery through deep conversations with 4 AI mirrors. Foundation, Regulation, Expansion, Integration.",
  openGraph: {
    title: "ANIMA - Journey of Self-Discovery",
    description: "Structured self-discovery through deep conversations with 4 AI mirrors.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
