import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mas Dent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Material Symbols loaded in <head> to prevent Flash of Unstyled Text (FOUT) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
