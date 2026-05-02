import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GiftBoxWrapper from "@/components/gift/GiftBoxWrapper";
import AuthIndicator from "@/components/ui/AuthIndicator";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AG — Personal Portfolio",
  description: "Welcome to my world — projects, stories, and everything in between.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-white font-sans">
        {children}
        <GiftBoxWrapper />
        <AuthIndicator />
        <Analytics />
      </body>
    </html>
  );
}
