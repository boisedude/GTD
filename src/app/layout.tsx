import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clarity Done - Calm. Clear. Done.",
  description:
    "A productivity app inspired by David Allen's Getting Things Done methodology. Calm. Clear. Done. Not affiliated with or licensed by David Allen or GTD®.",
  keywords: [
    "gtd",
    "productivity",
    "task management",
    "getting things done",
    "organization",
  ],
  authors: [{ name: "Clarity Done Team" }],
  creator: "Clarity Done",
  publisher: "Clarity Done",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Clarity Done - GTD Task Manager",
    description:
      "Transform your productivity with a clean, intuitive GTD-inspired task management application.",
    type: "website",
    locale: "en_US",
    siteName: "Clarity Done",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clarity Done - GTD Task Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clarity Done - GTD Task Manager",
    description:
      "Transform your productivity with a clean, intuitive GTD-inspired task management application.",
    images: ["/twitter-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Clarity Done",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
    { media: "(prefers-color-scheme: dark)", color: "#0891b2" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/images/clarity-done-logo.png"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        {/* Skip navigation for keyboard users */}
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        <PWAProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
