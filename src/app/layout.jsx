import { Geist, Geist_Mono } from "next/font/google";
import { UserProvider } from "@/context/UserContext";
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
  title: "Telegram Mini App - Question Upload",
  description: "Telegram Earning Mini App with Question Upload Task",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Telegram WebApp official SDK */}
        <script src="https://telegram.org/js/telegram-web-app.js"></script>

        {/* Monetag Official Rewarded Interstitial SDK (Zone: 11576758) */}
        <script
          src="//libtl.com/sdk.js"
          data-zone="11576758"
          data-sdk="show_11576758"
        ></script>
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white overflow-x-hidden antialiased">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
