import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { SplashScreen } from "@/components/SplashScreen";
import { BugReporter } from "@/components/BugReporter";
import { CookieConsent } from "@/components/CookieConsent";
import { AutoFullscreen } from "@/components/AutoFullscreen";
import ScreenshotGuard from "@/components/ScreenshotGuard";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "روايتي — مكتبة الروايات الشخصية",
  description: "اقرأ روايات Medjahed Abdelhadi (Pica) في تجربة قراءة أنيقة وهادئة",
  keywords: ["رواية", "قراءة", "روايات عربية", "أدب", "روايتي", "Pica"],
  metadataBase: new URL("https://rewayati.vercel.app"),
  openGraph: {
    title: "روايتي — مكتبة الروايات الشخصية",
    description: "اقرأ روايات Medjahed Abdelhadi (Pica) في تجربة قراءة أنيقة وهادئة",
    locale: "ar_DZ",
    type: "website",
    url: "https://rewayati.vercel.app",
    siteName: "روايتي",
  },
  twitter: {
    card: "summary_large_image",
    title: "روايتي — مكتبة الروايات الشخصية",
    description: "اقرأ روايات Medjahed Abdelhadi (Pica) في تجربة قراءة أنيقة وهادئة",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "روايتي",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fdfcf8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1917" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Amiri = the logo / Arabic display font. Loaded here (not via CSS
            @import) so it is discovered during head parsing and painted with the
            correct font from the first frame — no FOUC glitch on "روايتي". */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=block"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=block"
        />
        {/* Prevent FOUC for dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('riwayati_theme');
                  if(t === 'dark') document.documentElement.classList.add('dark');
                } catch(e){}
              })();
            `,
          }}
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "روايتي",
              url: "https://rewayati.vercel.app",
              description: "مكتبة روايات شخصية — قراءة أنيقة وهادئة",
              inLanguage: "ar",
              author: {
                "@type": "Person",
                name: "Medjahed Abdelhadi",
                alternateName: "Pica",
                url: "https://rewayati.vercel.app/about",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://rewayati.vercel.app/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Vercel Analytics */}
        <script
          defer
          src="/_vercel/insights/script.js"
        />
        {/* Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ScreenshotGuard />
        <AppProvider>
          <ScrollProgress />
          <SplashScreen />
          <AutoFullscreen />
          <Header />
          <main className="flex-1 premium-bg">{children}</main>
          <CookieConsent />
          <BugReporter />
          <ScrollToTop />
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
