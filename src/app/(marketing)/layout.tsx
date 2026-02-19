import { Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className={spaceGrotesk.className}>{children}</div>
}
