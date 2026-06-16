import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { StructuredData } from "@/components/StructuredData";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MinesArena - Free Social Gaming Platform 2026 | Play Mines, Dice & More",
  description: "Experience exciting social games with virtual coins - no real money! Play Mines, Dice, Coinflip & Plinko for free. Compete on leaderboards, earn rewards. 100% entertainment, zero risk. Join thousands of players today!",
  keywords: [
    "social gaming",
    "free social games",
    "virtual coin games",
    "entertainment games",
    "mines game",
    "dice game online",
    "coinflip game",
    "plinko game",
    "free gaming platform",
    "social gaming platform 2026",
    "play games for fun",
    "virtual arcade",
    "skill games online",
    "leaderboard games",
    "competitive gaming",
    "free to play games",
    "social entertainment",
    "gaming simulator",
    "virtual gaming arena"
  ],
  authors: [{ name: "MinesArena" }],
  creator: "MinesArena",
  publisher: "MinesArena",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/arenalogo.ico',
    shortcut: '/arenalogo.ico',
    apple: '/arenalogo.png',
  },
  openGraph: {
    title: "MinesArena - Free Social Gaming Platform | Virtual Coin Games",
    description: "Play exciting social games with virtual coins - Mines, Dice, Coinflip & Plinko! Pure entertainment, no real money. Compete on leaderboards and have fun!",
    type: "website",
    url: "https://minesarena.com",
    siteName: "MinesArena",
    images: [
      {
        url: "/logowithtext.png",
        width: 1200,
        height: 630,
        alt: "MinesArena - Social Gaming Platform 2026",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MinesArena - Free Social Gaming Platform",
    description: "Experience provably fair social games for free. Play Mines, Dice, Coinflip & Plinko with virtual coins!",
    images: ["/logowithtext.png"],
    creator: "@minesarena",
  },
  alternates: {
    canonical: "https://minesarena.com",
  },
  category: "Gaming",
  classification: "Social Entertainment Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        <StructuredData />
      </head>
      <body className="bg-[#080a10] text-white antialiased" style={{ fontFamily: "var(--font-outfit), 'Outfit', system-ui, sans-serif" }}>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-X183Y3QFJP"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-X183Y3QFJP');
            `,
          }}
        />
        
        <AuthProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
