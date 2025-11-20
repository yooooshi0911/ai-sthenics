import type { Metadata, Viewport } from "next"; // Viewportを追加
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LoadingScreen from '@/components/common/LoadingScreen';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI-STHENICS",
  description: "あなたのポケットにAIパーソナルトレーナーを",
};

// ▼▼▼ これを追加！画面の拡大・縮小を禁止する設定 ▼▼▼
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
// ▲▲▲ ここまで ▲▲▲

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}