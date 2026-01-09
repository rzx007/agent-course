import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProviders } from "./tanstack-query-provider";
import { Providers } from "./auth-ui-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAG Chatbot",
  description: "A RAG chatbot built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProviders>
          <Providers>{children}</Providers>
        </QueryProviders>
      </body>
    </html>
  );
}
