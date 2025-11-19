'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // 作成したuseAuthフックをインポート
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, isLoading } = useAuth(); // ログイン情報を取得
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // ログアウト後にログインページへ
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-800 p-4 shadow-md">
      <nav className="flex justify-center items-center gap-8">
        {/* ログインしている時だけ表示するリンク */}
        {user && (
          <>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-lg">
              ホーム
            </Link>
            {/* ▼▼▼ ダッシュボードへのリンクを追加 ▼▼▼ */}
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-lg">
              ダッシュボード
            </Link>
            <Link href="/history" className="text-gray-300 hover:text-white transition-colors text-lg">
              履歴
            </Link>
          </>
        )}
        
        {/* ログイン状態に応じてボタンを切り替え */}
        {isLoading ? (
          <div className="text-gray-400">...</div>
        ) : user ? (
          <button onClick={handleLogout} className="text-gray-300 hover:text-white transition-colors text-lg">
            ログアウト
          </button>
        ) : (
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-lg">
            ログイン
          </Link>
        )}
      </nav>
    </header>
  );
}