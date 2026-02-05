import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProviders } from "@/components/tanstack-query-provider";
import { Providers } from "@/components/auth-ui-provider";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";
import Script from "next/script";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem>
          <QueryProviders>
            <Providers>{children}</Providers>
          </QueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
