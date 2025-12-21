import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Xeni - Immigration Case Management',
  description: 'Streamline your immigration case workflow with AI-powered document processing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
