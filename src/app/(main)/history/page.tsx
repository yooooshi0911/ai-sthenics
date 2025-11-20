'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { WorkoutSection } from '@/types';
import LoadingScreen from '@/components/common/LoadingScreen'; // ← インポート追加


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
  const router = useRouter();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveWorkout, setHasActiveWorkout] = useState(false);

  useEffect(() => {
    const savedWorkout = localStorage.getItem('currentWorkout');
    if (savedWorkout) {
      setHasActiveWorkout(true);
    }

    const fetchHistory = async () => {
      if (!user) return;
      setIsLoading(true);
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

  const handleResumeWorkout = () => {
    router.push('/workout');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }
  // ▲▲▲ ここまで ▲▲▲

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      
      <div className="flex justify-center mb-6">
        <div className="bg-gray-800 p-1 rounded-lg flex">
          <button className="px-6 py-2 bg-gray-600 rounded text-white font-bold text-sm">
            履歴一覧
          </button>
          <Link href="/dashboard" className="px-6 py-2 text-gray-400 hover:text-white font-bold text-sm">
            分析グラフ
          </Link>
        </div>
      </div>

      {hasActiveWorkout && (
        <div className="max-w-2xl mx-auto mb-8 bg-blue-900 border border-blue-500 p-4 rounded-lg flex justify-between items-center shadow-lg animate-pulse">
          <div>
            <p className="font-bold text-blue-100">⚠️ 未完了のトレーニングがあります</p>
            <p className="text-xs text-blue-300">前回のセッションを再開しますか？</p>
          </div>
          <button 
            onClick={handleResumeWorkout}
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
          >
            再開する
          </button>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6 text-center">トレーニング履歴</h1>
      
      {history.length === 0 ? (
        <p className="text-center text-gray-400">まだトレーニング履歴がありません。</p>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {history.map((workout) => (
            // ▼▼▼ Linkで囲んでクリック可能にする ▼▼▼
            <Link href={`/history/${workout.id}`} key={workout.id} className="block group">
              <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700 transition-colors group-hover:border-blue-500 group-hover:bg-gray-750">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">{formatDate(workout.date)}</p>
                    <p className="text-xl font-semibold text-white mt-1 group-hover:text-blue-300 transition-colors">{workout.theme}</p>
                  </div>
                  <span className="text-gray-500 text-xl">›</span>
                </div>
                <ul className="mt-2 list-disc list-inside text-gray-300 text-sm">
                  {workout.sections?.[0]?.exercises?.[0]?.name && <li>{workout.sections[0].exercises[0].name}</li>}
                  {workout.sections?.[1]?.exercises?.[0]?.name && <li>{workout.sections[1].exercises[0].name}</li>}
                  <span className="text-gray-500 text-xs ml-4">...ほか</span>
                </ul>
              </div>
            </Link>
            // ▲▲▲ ここまで ▲▲▲
          ))}
        </div>
      )}
    </div>
  );
}