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
  title: "Casino Simulator 2026 - Best Virtual Casino Games Online | MinesArena",
  description: "Experience the ultimate casino simulator 2026 with provably fair virtual casino games. Play Mines, Dice, Coinflip & Plinko online free. Best Stake alternative with no deposit required. Join thousands playing virtual casino mobile games today!",
  keywords: [
    "casino simulator",
    "casino simulator 2026",
    "virtual casino",
    "virtual casino games",
    "virtual casino mobile",
    "free online virtual casino games",
    "virtual casino no deposit",
    "the virtual casino",
    "stake alternative",
    "best stake alternative",
    "stake alternative 2025",
    "stake alternative sites",
    "grand casino simulator",
    "casino simulator game",
    "casino simulator online",
    "casino simulator free",
    "online casino",
    "crown coins casino",
    "what is a virtual casino"
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
    title: "Casino Simulator 2026 - Virtual Casino Games | MinesArena",
    description: "Play the best casino simulator 2026 with free virtual casino games. Provably fair Mines, Dice, Coinflip & Plinko. Top Stake alternative - no deposit, no real money, pure entertainment!",
    type: "website",
    url: "https://minesarena.com",
    siteName: "MinesArena",
    images: [
      {
        url: "/logowithtext.png",
        width: 1200,
        height: 630,
        alt: "MinesArena - Casino Simulator 2026",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Casino Simulator 2026 - Virtual Casino Games",
    description: "Experience provably fair virtual casino games free. Best Stake alternative with Mines, Dice, Coinflip & Plinko!",
    images: ["/logowithtext.png"],
    creator: "@minesarena",
  },
  alternates: {
    canonical: "https://minesarena.com",
  },
  category: "Gaming",
  classification: "Virtual Casino Simulator",
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
