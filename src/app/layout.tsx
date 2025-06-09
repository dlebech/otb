import type { Metadata } from 'next'
import '../css/index.css'
import 'bootstrap/dist/css/bootstrap.css'
import ReduxProvider from '../components/ReduxProvider'

export const metadata: Metadata = {
  title: 'OTB - Bank Transaction Analysis Tool',
  description: 'Bank Transaction Analysis Tool built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <noscript>
          You need to enable JavaScript to run this app.
        </noscript>
        <div id="root">
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </div>
      </body>
    </html>
  )
}
