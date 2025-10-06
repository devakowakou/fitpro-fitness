import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/Theme-Provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitPro Fitness - Transform Your Body, Transform Your Life",
  description:
    "Join our fitness programs and achieve your goals with expert trainers and personalized plans. Start your transformation today.",
  keywords: [
    "fitness",
    "gym",
    "workout",
    "personal training",
    "strength training",
    "cardio",
    "yoga",
    "nutrition",
    "weight loss",
    "muscle building",
    "fitness programs",
    "health",
    "wellness",
  ],
  authors: [{ name: "FitPro Fitness" }],
  creator: "FitPro Fitness",
  publisher: "FitPro Fitness",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fitpro-fitness.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FitPro Fitness - Transform Your Body, Transform Your Life",
    description:
      "Join our fitness programs and achieve your goals with expert trainers and personalized plans. Start your transformation today.",
    url: "https://fitpro-fitness.com",
    siteName: "FitPro Fitness",
    images: [
      {
        url: "/fitness-hero.jpeg",
        width: 1200,
        height: 630,
        alt: "FitPro Fitness - Professional Training",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitPro Fitness - Transform Your Body, Transform Your Life",
    description:
      "Join our fitness programs and achieve your goals with expert trainers and personalized plans.",
    images: ["/fitness-hero.jpeg"],
    creator: "@fitpro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className={`${inter.variable} ${oswald.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
