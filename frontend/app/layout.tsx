import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// ✅ FIX IMPORT: Gunakan relative path titik satu (./)
// Karena layout.tsx dan folder components berada di level 'app' yang sama
import GoogleTranslateWidget from "./components/GoogleTranslateWidget";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ijo-Ijo App",
  description: "Aplikasi pengelolaan sampah modern",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className="antialiased font-[family-name:var(--font-poppins)]">
        
        {children}

        {/* Widget dipasang di sini */}
        <GoogleTranslateWidget />
        
      </body>
    </html>
  );
}