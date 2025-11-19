'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // 認証情報を取得
import { supabase } from '@/lib/supabase/client'; // Supabaseクライアント

export default function OnboardingPage() {
  const { user } = useAuth(); // ログインしているユーザー情報を取得
  const [goal, setGoal] = useState('muscle_hypertrophy');
  const [level, setLevel] = useState('intermediate');
  const router = useRouter();

  const handleSaveSettings = async () => {
    if (!user) {
      alert('ユーザー情報が取得できませんでした。');
      return;
    }

    try {
      // Supabaseのprofilesテーブルを更新
      const { error } = await supabase
        .from('profiles')
        .update({ goal, level }) // goalとlevelを更新
        .eq('id', user.id); // ログインしているユーザーのIDと一致する行を対象

      if (error) throw error;
      
      alert('設定を保存しました！');
      router.push('/');
    } catch (err) {
      console.error('設定の保存に失敗しました:', err);
      alert('設定の保存に失敗しました。');
    }
  };

  // ... (return以下のJSXは変更なし)
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {/* ... */}
    </main>
  );
}