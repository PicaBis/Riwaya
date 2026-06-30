import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { AntiScreenshot } from "@/components/AntiScreenshot";

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
      </head>
      <body className="min-h-screen flex flex-col">
        <AppProvider>
          <AntiScreenshot />
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-parchment-200 dark:border-white/8 py-8 mt-16">
            <div className="max-w-6xl mx-auto px-4 text-center space-y-1">
              <p className="font-arabic text-sm text-gray-400 dark:text-gray-600">
                روايتي · riwayati.vercel.app
              </p>
              <p className="font-arabic text-xs text-gray-300 dark:text-gray-700">
                جميع الحقوق محفوظة لـ Medjahed Abdelhadi — Pica &copy; {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
