import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ticketing MVP",
  description: "Simple ticketing app with Next.js and SQLite"
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}