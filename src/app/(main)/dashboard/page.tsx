'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
// ▼▼▼ WorkoutSection型をインポート ▼▼▼
import type { WorkoutSection } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// DBから受け取るデータの型を定義
interface WorkoutData {
    date: string;
    sections: WorkoutSection[];
}

// グラフ用に整形したデータの型を定義
interface ChartData {
  date: string;
  volume: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);

      // ▼▼▼ DBから取得したデータに、上で定義したWorkoutData型を適用 ▼▼▼
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('date, sections')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .returns<WorkoutData[]>(); // ★★★これが重要！★★★

      if (error) {
        console.error("データの取得に失敗しました:", error);
        setIsLoading(false);
        return;
      }

      if (workouts) {
        const formattedData = workouts.map(workout => {
          let totalVolume = 0;
          // ▼▼▼ ここでTypeScriptが型を正しく理解できるようになった ▼▼▼
          workout.sections.forEach(section => {
            section.exercises.forEach(exercise => {
              exercise.sets.forEach(set => {
                totalVolume += set.weight * set.reps;
              });
            });
          });
          return {
            date: new Date(workout.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
            volume: totalVolume,
          };
        });
        setChartData(formattedData);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [user]);

  if (isLoading) {
    return <div className="text-center p-8 text-white">グラフデータを読み込み中...</div>;
  }
  
  // return以下のJSXは変更なし
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">ダッシュボード</h1>
      {chartData.length < 2 ? (
        <div className="text-center p-8 bg-gray-800 rounded-lg">
          <p className="text-gray-400">グラフを表示するには、トレーニング履歴が2件以上必要です。</p>
        </div>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg" style={{ width: '100%', height: 400 }}>
          <h2 className="text-xl font-semibold mb-4">トレーニングボリュームの推移</h2>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
              <XAxis dataKey="date" stroke="#A0AEC0" />
              <YAxis stroke="#A0AEC0" />
              <Tooltip
                contentStyle={{ backgroundColor: '#2D3748', border: 'none' }}
                labelStyle={{ color: '#E2E8F0' }}
              />
              <Legend wrapperStyle={{ color: '#E2E8F0' }} />
              <Line type="monotone" dataKey="volume" name="総ボリューム (kg)" stroke="#4299E1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}