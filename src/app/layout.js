import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Vary Header Demo - AI-powered content negotiation",
  description: "Interactive demo for Vary HTTP header with AI-powered content negotiation",
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:text-gray-300">
                Language Demo
              </Link>
            </li>
          </ul>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  )
}
