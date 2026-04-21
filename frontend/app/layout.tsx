import type { Metadata } from 'next'
import { NotificationProvider } from '@/lib/notification-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dropout Early Warning System',
  description: 'AI-powered student dropout prediction and early intervention system',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-950">
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  )
}