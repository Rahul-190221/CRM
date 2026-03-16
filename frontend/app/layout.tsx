import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { SocketProvider } from '@/components/providers/SocketProvider'
import './globals.css'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'Luminedge CRM',
  description: 'Premium CRM for exam venue management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-body bg-white`}>
        {/* ── Ambient animated lighting background ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <div className="ambient-blob-1 absolute rounded-full blob-1" />
          <div className="ambient-blob-2 absolute rounded-full blob-2" />
          <div className="ambient-blob-3 absolute rounded-full blob-3" />
          <div className="ambient-blob-4 absolute rounded-full blob-4" />
        </div>

        {/* ── Page content ── */}
        <div className="relative z-10">
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
            <SocketProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#fff',
                    color: '#00000F',
                    border: '1px solid rgba(250,206,57,0.3)',
                    boxShadow: '0 4px 20px rgba(250,206,57,0.15)',
                    fontFamily: 'Montserrat, sans-serif',
                  },
                }}
              />
              {children}
            </SocketProvider>
          </GoogleOAuthProvider>
        </div>
      </body>
    </html>
  )
}
