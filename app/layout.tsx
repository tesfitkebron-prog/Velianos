import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { OfflineSync } from "@/components/OfflineSync";
import { PushSync } from "@/components/PushSync";
import { AuthSessionGuard } from "@/components/layout/AuthSessionGuard";
import { ToastProvider } from "@/components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://velianos.fr"),
  title: "Velianos - L'assistant des artisans",
  description:
    "Ne perdez plus aucun client. Velianos répond à vos appels manqués par SMS.",
  applicationName: "Velianos",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Velianos",
    title: "Velianos - L'assistant des artisans",
    description:
      "Ne perdez plus aucun client. Velianos répond à vos appels manqués par SMS.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Velianos - L'assistant des artisans",
      },
    ],
  },
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F5F5F7",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#F5F5F7" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Velianos" />
      </head>
      <body className={`${inter.className} min-h-full bg-[#F5F5F7] text-slate-900`}>
        <ToastProvider>
          <AuthSessionGuard />
          {children}
          <PWARegister />
          <InstallPrompt />
          <OfflineSync />
          <PushSync />
        </ToastProvider>
      </body>
    </html>
  );
}
