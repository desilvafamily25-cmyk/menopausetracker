import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Pause Sleep — Menopause Symptom Tracker",
  description:
    "Track your menopause symptoms, identify triggers, and generate doctor-ready reports. Created by Dr. Premila Hewage.",
  keywords: ["menopause", "symptom tracker", "hot flushes", "perimenopause", "women's health"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pause Sleep",
  },
  openGraph: {
    title: "Pause Sleep — Menopause Symptom Tracker",
    description: "Track your menopause symptoms, identify triggers, and generate doctor-ready reports.",
    url: "https://menopausetracker.netlify.app",
    siteName: "Pause Sleep",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3B241C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
      </head>
      <body className="antialiased min-h-screen bg-[#FBF4EC]">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
