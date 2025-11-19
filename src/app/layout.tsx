import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; // ← これをインポート

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI-STHENICS",
  description: "あなたのポケットにAIパーソナルトレーナーを",
};

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
      {/* ▼▼▼ bodyタグの中身をAuthProviderで囲む ▼▼▼ */}
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}