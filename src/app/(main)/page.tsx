'use client'; // ← ★★★ これが、私が忘れてしまった魔法の一行です ★★★

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { Workout } from '@/types';

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [trainingTime, setTrainingTime] = useState('60');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // (関数のロジックやreturn文は、前回提示したもので完璧です。変更は一切ありません)
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
      const { data: profile, error: profileError } = await supabase.from('profiles').select('goal, level').eq('id', user.id).single();
      if (profileError) throw profileError;
      const { data: history, error: historyError } = await supabase.from('workouts').select('date, theme').eq('user_id', user.id).order('date', { ascending: false }).limit(5);
      if (historyError) throw historyError;
      const response = await fetch('/api/generate-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingTime: Number(trainingTime),
          history: history,
          goal: profile.goal,
          level: profile.level,
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
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">AI-STHENICS</h1>
        <p className="text-gray-400 mt-2">あなたのポケットにAIトレーナーを</p>
      </div>
      <div className="mt-16 w-full max-w-sm">
        <label htmlFor="training-time" className="block text-lg font-medium text-center">
          今日のトレーニング時間は？
        </label>
        <div className="mt-2 flex items-center">
          <input
            id="training-time"
            type="number"
            value={trainingTime}
            onChange={(e) => setTrainingTime(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white text-2xl text-center rounded-l-md p-4"
            step="15"
            disabled={isLoading}
          />
          <span className="bg-gray-700 text-2xl p-4 rounded-r-md">分</span>
        </div>
        <div className="mt-6 h-20 flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <div className="flex justify-center items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>AIがメニューを生成中...</p>
              </div>
              <p className="text-sm text-gray-400 mt-2">あなたの成長プランを計算しています</p>
            </div>
          ) : (
            <button
              onClick={handleCreateMenu}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-xl rounded-lg transition-transform transform hover:scale-105"
            >
              メニューを作成する
            </button>
          )}
        </div>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </main>
  );
}