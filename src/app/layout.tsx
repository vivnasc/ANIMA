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
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
