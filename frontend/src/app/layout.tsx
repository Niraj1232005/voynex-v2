import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "VOYNEX – Complete Travel Companion",
  description: "Discover, plan, and book unforgettable journeys with AI-powered tools. Your all-in-one travel platform.",
  keywords: "travel, trips, booking, AI planner, packing assistant, travel shop",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
