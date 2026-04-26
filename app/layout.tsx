import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pause Sleep — Menopause Symptom Tracker",
  description:
    "Track your menopause symptoms, identify triggers, and generate doctor-ready reports. Created by Dr. Premila Hewage.",
  keywords: ["menopause", "symptom tracker", "hot flushes", "perimenopause", "women's health"],
  openGraph: {
    title: "Pause Sleep — Menopause Symptom Tracker",
    description: "Track your menopause symptoms, identify triggers, and generate doctor-ready reports.",
    url: "https://tracker.pausesleep.com.au",
    siteName: "Pause Sleep",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen bg-[#F7F5F0]">
        {children}
      </body>
    </html>
  );
}
