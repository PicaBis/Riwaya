import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { AntiScreenshot } from "@/components/AntiScreenshot";
import { SplashScreen } from "@/components/SplashScreen";
import { BugReporter } from "@/components/BugReporter";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "روايتي — مكتبة الروايات الشخصية",
  description: "اقرأ روايات Medjahed Abdelhadi (Pica) في تجربة قراءة أنيقة وهادئة",
  keywords: ["رواية", "قراءة", "روايات عربية", "أدب", "روايتي", "Pica"],
  metadataBase: new URL("https://riwayati.vercel.app"),
  openGraph: {
    title: "روايتي",
    description: "مكتبة روايات شخصية — قراءة أنيقة وهادئة",
    locale: "ar_DZ",
    type: "website",
    url: "https://riwayati.vercel.app",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
              url: "https://riwayati.vercel.app",
              description: "مكتبة روايات شخصية — قراءة أنيقة وهادئة",
              inLanguage: "ar",
              author: {
                "@type": "Person",
                name: "Medjahed Abdelhadi",
                alternateName: "Pica",
                url: "https://riwayati.vercel.app/about",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://riwayati.vercel.app/?q={search_term_string}",
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
      </head>
      <body className="min-h-screen flex flex-col">
        <AppProvider>
          <SplashScreen />
          <AntiScreenshot />
          <Header />
          <main className="flex-1 premium-bg">{children}</main>
          <CookieConsent />
          <BugReporter />
          <footer className="border-t border-parchment-200 dark:border-white/8 py-10 mt-16 bg-white/50 dark:bg-onyx-900/50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8" dir="rtl">
                {/* Brand */}
                <div>
                  <h3 className="font-arabic text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">روايتي</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic leading-relaxed">
                    منصة روايات عربية شخصية — تجربة قراءة أنيقة ومريحة للأدب الجزائري والعربي.
                  </p>
                </div>

                {/* Links */}
                <div>
                  <h4 className="font-arabic text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">روابط سريعة</h4>
                  <ul className="space-y-2">
                    <li><a href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 font-arabic transition-colors">الرئيسية</a></li>
                    <li><a href="/library" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 font-arabic transition-colors">المكتبة</a></li>
                    <li><a href="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 font-arabic transition-colors">عن المنصة</a></li>
                    <li><a href={`mailto:Medjahed10abdelhadi@gmail.com`} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gold-500 font-arabic transition-colors">اتصل بنا</a></li>
                  </ul>
                </div>

                {/* Social / Contact */}
                <div>
                  <h4 className="font-arabic text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">تواصل مع الكاتب</h4>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="mailto:Medjahed10abdelhadi@gmail.com"
                      className="px-3 py-1.5 rounded-lg bg-parchment-100 dark:bg-white/5 border border-parchment-200 dark:border-white/10 text-xs font-arabic text-gray-600 dark:text-gray-400 hover:text-gold-500 hover:border-gold-500/30 transition-colors"
                    >
                      ✉️ البريد الإلكتروني
                    </a>
                  </div>
                  <p className="text-xs text-gray-400 font-arabic mt-3">
                    Medjahed10abdelhadi@gmail.com
                  </p>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="border-t border-parchment-200 dark:border-white/8 pt-6 text-center">
                <p className="font-arabic text-sm text-gray-400 dark:text-gray-600">
                  روايتي · riwayati.vercel.app
                </p>
                <p className="font-arabic text-xs text-gray-300 dark:text-gray-700 mt-1">
                  جميع الحقوق محفوظة لـ Medjahed Abdelhadi — Pica &copy; {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
