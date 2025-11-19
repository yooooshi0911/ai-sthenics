'use client';

import Header from '@/components/common/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 読み込みが完了し、かつユーザーがいない場合
    if (!isLoading && !user) {
      router.push('/login'); // ログインページにリダイレクト
    }
  }, [user, isLoading, router]);

  // 読み込み中またはユーザーがいる場合のみ、ページ内容を表示
  if (isLoading || !user) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">読み込み中...</div>;
  }

  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}