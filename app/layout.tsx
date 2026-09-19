import type {Metadata} from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'MaximusLabs Listicle Pages',
  description: 'Evidence-led MaximusLabs agency directories and listicle pages.',
  // Point the favicon at stable absolute URLs (the MaximusLabs pinwheel on the
  // brand CDN) so it loads directly under the /blog reverse proxy — the Next
  // file-convention icons are served at hashed paths (/icon.svg?<hash>) that the
  // proxy does not route.
  icons: {
    icon: [
      {
        url: 'https://cdn.prod.website-files.com/688e61db3da1f79ad7b457dd/68a189a95072705bf5381d6e_favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: 'https://cdn.prod.website-files.com/688e61db3da1f79ad7b457dd/68a189ae4f772123c8ebb7be_webclip.svg',
  },
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

