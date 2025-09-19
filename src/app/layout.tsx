import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { PWAProvider } from "@/components/pwa/PWAProvider";

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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
    { media: "(prefers-color-scheme: dark)", color: "#0891b2" },
  ],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PWAProvider>
          <AuthProvider>{children}</AuthProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
