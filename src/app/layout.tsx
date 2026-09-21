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
      <body className="min-h-screen bg-[#f8fafc] text-[#0f172a] antialiased selection:bg-[#30a0e0]/30 selection:text-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
