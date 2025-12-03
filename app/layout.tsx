"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { BackgroundWrapper } from "@/components/pro/background-wrapper";
import { StoreHydrator } from "@/components/providers/store-hydrator";
import { SessionValidator } from "@/components/providers/session-validator";
import { AuthListener } from "@/components/providers/auth-listener";
import { FontProvider } from "@/components/providers/font-provider";
import { SpotifyPlayer } from "@/components/timer/spotify-player";
import { AudioMixer } from "@/components/timer/audio-mixer";
import Head from "next/head";
import {
  inter,
  roboto,
  poppins,
  montserrat,
  lato,
  openSans,
  raleway,
  nunito,
} from "@/lib/fonts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <title>
          BlackFocus - Free Pomodoro Timer Online | Focus Timer & Productivity
          App
        </title>
        <meta
          name="description"
          content="Free online Pomodoro timer and focus timer. Black minimalist design, no distractions. Track productivity with built-in analytics. Perfect for study, work, and deep focus sessions."
        />
        <meta
          name="keywords"
          content="pomodoro timer, focus timer, timer online, black timer, minimal timer, productivity timer, study timer, work timer, pomodoro technique, time management, black focus timer, concentration timer, distraction free timer, pomodoro app, focus app, productivity app, online timer, free timer, minimalist timer, dark timer, pomodoro clock, focus clock, time tracker, session timer, break timer, chronometer"
        />
        <meta name="author" content="BlackFocus" />
        <meta name="robots" content="index, follow" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blackfocus.app/" />
        <meta
          property="og:title"
          content="BlackFocus - Free Pomodoro Timer & Focus Timer Online"
        />
        <meta
          property="og:description"
          content="Free online Pomodoro timer with black minimalist design. Stay focused, track productivity, achieve more."
        />
        <meta property="og:image" content="/icon-512x512.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://blackfocus.app/" />
        <meta
          property="twitter:title"
          content="BlackFocus - Free Pomodoro Timer & Focus Timer"
        />
        <meta
          property="twitter:description"
          content="Free online Pomodoro timer with black minimalist design. Stay focused, track productivity."
        />
        <meta property="twitter:image" content="/icon-512x512.png" />

        {/* Theme Colors */}
        <meta
          name="theme-color"
          content="#0a0a0a"
          media="(prefers-color-scheme: dark)"
        />
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BlackFocus" />

        {/* Favicon */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icon-512x512.png"
        />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://blackfocus.app/" />

        {/* Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "BlackFocus",
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              description:
                "Free online Pomodoro timer and focus timer with analytics and cloud sync. Perfect for productivity and time management.",
              url: "https://blackfocus.app",
              screenshot: "/icon-512x512.png",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5",
                ratingCount: "1",
              },
            }),
          }}
        />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} ${montserrat.variable} ${lato.variable} ${openSans.variable} ${raleway.variable} ${nunito.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <AuthListener />
          <SessionValidator />
          <StoreHydrator />
          <FontProvider>
            <SpotifyPlayer />
            <BackgroundWrapper>
              <div className="min-h-screen bg-background/65 text-foreground">
                <Header />
                <main>{children}</main>
              </div>
            </BackgroundWrapper>
          </FontProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
