'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/');
      router.refresh(); 
    } catch (err: any) {
      setError('メールアドレスまたはパスワードが間違っています。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold text-center">ログイン</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded"
            />
          </div>
          <div>
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded"
            />
          </div>
          <button type="submit" className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold">
            ログイン
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
        {/* ▼▼▼ この部分が正しいか確認 ▼▼▼ */}
        <p className="text-center">
          アカウントをお持ちでないですか？{' '}
          <Link href="/signup" className="text-blue-400 hover:underline">
            新規登録
          </Link>
        </p>
        {/* ▲▲▲ ここまで ▲▲▲ */}
      </div>
    </div>
  );
}