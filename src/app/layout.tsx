import type { Metadata } from 'next';
import './globals.css';
import { UiProvider } from '@/components/ui-context';

export const metadata: Metadata = {
  title: 'Noor — منصة تعلم القرآن',
  description: 'A quiet journey: memorize, review, and learn with live teachers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <UiProvider>{children}</UiProvider>
      </body>
    </html>
  );
}
