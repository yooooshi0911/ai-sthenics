'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { WorkoutSection } from '@/types'; // 型をWorkoutSectionに変更


interface HistoryRecord {
  id: string;
  date: string;
  theme: string;
  sections: WorkoutSection[];
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  };
  return new Intl.DateTimeFormat('ja-JP', options).format(date);
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setIsLoading(true);

      // ▼▼▼ 読み込む列を新しい設計に合わせる ▼▼▼
      const { data, error } = await supabase
        .from('workouts')
        .select('id, date, theme, sections')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('履歴の取得に失敗しました:', error);
      } else if (data) {
        setHistory(data);
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, [user]);

  if (isLoading) {
    return <div className="text-center p-8 text-white">履歴を読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">トレーニング履歴</h1>
      {history.length === 0 ? (
        <p className="text-center text-gray-400">まだトレーニング履歴がありません。</p>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* ▼▼▼ 表示する内容を新しいデータ構造に合わせる ▼▼▼ */}
          {history.map((workout) => (
            <div key={workout.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-gray-400 text-sm">{formatDate(workout.date)}</p>
              <p className="text-xl font-semibold text-white mt-1">{workout.theme}</p>
              <ul className="mt-2 list-disc list-inside text-gray-300">
                {/* 最初のセクションの最初の種目だけ表示する、などのシンプルな表示例 */}
                {workout.sections[0]?.exercises[0]?.name && <li>{workout.sections[0].exercises[0].name}</li>}
                {workout.sections[1]?.exercises[0]?.name && <li>{workout.sections[1].exercises[0].name}</li>}
                ...and more
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}