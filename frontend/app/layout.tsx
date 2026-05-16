import type { Metadata } from 'next';
import { NotificationProvider } from '@/lib/notification-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dropout Early Warning System',
  description: 'AI-powered student dropout prediction and early intervention system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ Force LIGHT mode always */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.classList.remove('dark');
            `,
          }}
        />
      </head>

      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}