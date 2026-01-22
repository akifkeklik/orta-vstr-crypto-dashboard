import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- BAŞLIK AYARLARI (SEO & BRANDING) ---
export const metadata: Metadata = {
  title: "CoinMeter Pro | Enterprise Terminal", // Sekmede görünecek isim
  description:
    "Real-time advanced crypto analytics for VSTR, ORTA, and Global Markets.", // Google açıklaması
  icons: {
    icon: "/favicon.ico", // Vercel'e attığında favicon'un varsa burası da çalışır
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
