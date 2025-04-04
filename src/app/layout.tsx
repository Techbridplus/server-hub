import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/app/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Server Hub",
  description: "Create, join and manage servers in one place",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Set default theme if not set
                  if (!localStorage.getItem('theme')) {
                    localStorage.setItem('theme', 'dark');
                  }
                  
                  // Set default color scheme if not set
                  if (!localStorage.getItem('colorScheme')) {
                    localStorage.setItem('colorScheme', 'blue');
                  }
                  
                  const theme = localStorage.getItem('theme');
                  const colorScheme = localStorage.getItem('colorScheme');
                  
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-color-scheme', colorScheme);
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}



import './globals.css'