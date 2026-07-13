import type { Metadata } from "next";
import { Courier_Prime, EB_Garamond, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from 'react-hot-toast'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-courier",
});

const garamound = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-garamound",
});

export const metadata: Metadata = {
  title: "'Aṣora Clothiers - Heritage & Craft",
  description:
    "Curating the finest heritage collections through contemporary luxury fashion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${courierPrime.variable} ${garamound.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <QueryProvider>
          <AuthProvider>
            <Toaster />
            <main className="flex-grow">{children}</main>
            {/* <Footer /> */}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
