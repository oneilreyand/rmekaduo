import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RME UI System",
  description: "Sistem komponen antarmuka untuk RME",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased selection:bg-[var(--action)] selection:text-white">
        {children}
      </body>
    </html>
  );
}
