import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";
import { AuthProvider } from "@/features/auth/presentation/providers/AuthProvider";
import { VehicleBrandProvider } from "@/features/vehicle-brands/presentation/providers/VehicleBrandProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "My Admin - Beautiful Dashboard",
  description: "A modern, responsive admin dashboard that works beautifully on mobile and web",
  manifest: "/manifest.json",
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

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
          <VehicleBrandProvider>
            <PWAInstaller />
            {children}
          </VehicleBrandProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
