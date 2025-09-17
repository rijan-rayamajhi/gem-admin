import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";
import { AuthProvider } from "@/features/auth/presentation/providers/AuthProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "My Admin - Beautiful Dashboard",
  description: "A modern, responsive admin dashboard that works beautifully on mobile and web",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Admin",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
    shortcut: "/favicon.png",
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
        className={`${montserrat.variable} antialiased`}
      >
        <AuthProvider>
          <PWAInstaller />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
