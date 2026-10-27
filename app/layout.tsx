import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";
import { InstallPrompt } from "@/components/InstallPrompt";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Velianos — Votre assistante IA",
  description: "Votre assistante IA pour ne plus rater un seul chantier",
  applicationName: "Velianos",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Velianos",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F8FAFC",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#F8FAFC" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Velianos" />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col bg-background text-text-primary`}>
        {children}
        <PWARegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
