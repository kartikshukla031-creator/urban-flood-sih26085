import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Urban Flood Intelligence | SIH26085 Flood Nowcasting System',
  description: 'High-resolution 0–3 hour urban flood nowcasting system coupling rainfall nowcasts, DEM micro-topography, and graph-based drainage network hydraulics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c16] text-slate-100 antialiased min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
