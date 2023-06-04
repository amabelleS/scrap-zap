import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Zap Compare',
  description: 'Upload a Google Sheets file and compare the products in it to the ones in your Zap account.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-800`}>{children}</body>
    </html>
  )
}
