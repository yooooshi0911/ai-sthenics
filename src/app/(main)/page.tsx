'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { Workout } from '@/types';

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [trainingTime, setTrainingTime] = useState('60');
  const [userRequest, setUserRequest] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && user) {
      const fetchProfile = async () => {
        const { data: profile, error } = await supabase.from('profiles').select('goal').eq('id', user.id).single();
        if (error && error.code === 'PGRST116') {
          router.push('/onboarding');
        } else if (profile && !profile.goal) {
          router.push('/onboarding');
        }
      };
      fetchProfile();
    }
  }, [user, isAuthLoading, router]);

  const handleCreateMenu = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      // ▼▼▼ 修正点1: personal_info を確実に取得 ▼▼▼
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('goal, level, personal_info') // ← ここが重要！
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // デバッグ用ログ: コンソールでデータが取れているか確認できます
      console.log("AIに送るプロフィール:", profile);

      // 履歴の取得（変更なし）
      const { data: history, error: historyError } = await supabase
        .from('workouts')
        .select('date, theme')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      if (historyError) throw historyError;

      const response = await fetch('/api/generate-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingTime: Number(trainingTime),
          history: history,
          goal: profile.goal,
          level: profile.level,
          userRequest: userRequest,
          // ▼▼▼ 修正点2: 取得した personal_info をAPIに渡す ▼▼▼
          personalInfo: profile.personal_info, 
        }),
      });

      if (!response.ok) throw new Error('サーバーでエラーが発生しました。');
      const newWorkout: Workout = await response.json();
      localStorage.setItem('currentWorkout', JSON.stringify(newWorkout));
      router.push('/workout');
    } catch (err: any) {
      setError(err.message || 'メニューの作成に失敗しました。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="fixed inset-0 w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center p-4 overflow-hidden touch-none">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">AI-STHENICS</h1>
        <p className="text-gray-400 mt-2">あなたのポケットにAIトレーナーを</p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div>
          <label htmlFor="training-time" className="block text-lg font-medium text-center mb-2">
            今日のトレーニング時間は？
          </label>
          <div className="flex items-center">
            <input
              id="training-time"
              type="number"
              value={trainingTime}
              onChange={(e) => setTrainingTime(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-2xl text-center rounded-l-md p-4 focus:outline-none focus:border-blue-500"
              step="15"
              disabled={isLoading}
            />
            <span className="bg-gray-700 text-2xl p-4 rounded-r-md">分</span>
          </div>
        </div>

        <div>
          <label htmlFor="user-request" className="block text-sm font-medium text-gray-400 text-center mb-2">
            今日の要望や体調（任意）
          </label>
          <textarea
            id="user-request"
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            placeholder="例: 肩が痛いので無理せず、腹筋を多めにしたい"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-3 focus:outline-none focus:border-blue-500 text-sm resize-none h-24"
            disabled={isLoading}
          />
        </div>
        
        <div className="h-16 flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <div className="flex justify-center items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>AIがプランを調整中...</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleCreateMenu}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-xl rounded-lg transition-transform transform hover:scale-105 shadow-lg"
            >
              メニューを作成する
            </button>
          )}
        </div>
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      </div>
    </main>
  );
}