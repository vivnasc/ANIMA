import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ANIMA - Jornada de Autoconhecimento",
  description: "Autoconhecimento estruturado através de conversas profundas com 4 espelhos de IA. Fundação, Regulação, Expansão, Integração.",
  metadataBase: new URL("https://animamirror.com"),
  openGraph: {
    title: "ANIMA - Jornada de Autoconhecimento",
    description: "Autoconhecimento estruturado através de conversas profundas com 4 espelhos de IA.",
    type: "website",
    url: "https://animamirror.com",
    siteName: "ANIMA",
    locale: "pt_PT",
  },
  twitter: {
    card: "summary_large_image",
    title: "ANIMA - Jornada de Autoconhecimento",
    description: "Autoconhecimento estruturado através de conversas profundas com 4 espelhos de IA.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
