'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-gray-800 p-4 shadow-md">
      <nav className="flex justify-between items-center px-4 max-w-md mx-auto">
        {/* ホームへのリンク */}
        <Link href="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
          AI-STHENICS
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            {/* 履歴＆ダッシュボードへの統合ボタン */}
            <Link href="/history" className="text-gray-300 hover:text-white transition-colors text-sm flex flex-col items-center">
              <span>📊</span>
              <span>履歴/分析</span>
            </Link>

            {/* 設定ボタン（ログアウト含む） */}
            <Link href="/settings" className="text-gray-300 hover:text-white transition-colors text-sm flex flex-col items-center">
              <span>⚙️</span>
              <span>設定</span>
            </Link>
          </div>
        )}
        
        {!user && (
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
            ログイン
          </Link>
        )}
      </nav>
    </header>
  );
}