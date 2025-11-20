'use client';

import Header from '@/components/common/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen'; // ← インポート必須

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // ▼▼▼ 修正: 文字ではなくコンポーネントを返す ▼▼▼
  if (isLoading || !user) {
    return <LoadingScreen />;
  }
  // ▲▲▲ ここまで ▲▲▲

  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}