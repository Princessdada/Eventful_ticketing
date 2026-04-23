import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import ScrollProgress from "../components/ScrollProgress";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Eventful | Premium Ticketing Experience",
  description: "Book tickets for the most exclusive events with a premium glassmorphic experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} data-theme="dark">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AuthProvider>
          <ScrollProgress />
          <Navbar />
          <main style={{ flex: 1, paddingTop: '100px' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
