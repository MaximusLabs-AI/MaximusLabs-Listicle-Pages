import type {Metadata} from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'MaximusLabs Listicle Pages',
  description: 'Evidence-led MaximusLabs agency directories and listicle pages.',
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

