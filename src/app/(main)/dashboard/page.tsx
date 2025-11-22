'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { WorkoutSection } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLanguage } from '@/context/LanguageContext'; // ← グローバル設定を使う
import { useRouter } from 'next/navigation'; // 追加

interface WorkoutData {
    date: string;
    sections: WorkoutSection[];
}

interface ChartData {
  date: string;
  displayDate: string; // グラフ表示用
  volume: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t, language } = useLanguage(); // ← 言語設定を取得
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);

      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('date, sections')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .returns<WorkoutData[]>();

      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }

      if (workouts) {
        const localeMap = { ja: 'ja-JP', en: 'en-US', it: 'it-IT' };
        
        const formattedData = workouts.map(workout => {
          let totalVolume = 0;
          workout.sections.forEach(section => {
            section.exercises.forEach(exercise => {
              exercise.sets.forEach(set => {
                totalVolume += set.weight * set.reps;
              });
            });
          });

          return {
            date: workout.date,
            // 言語に合わせた日付フォーマット
            displayDate: new Date(workout.date).toLocaleDateString(localeMap[language] || 'en-US', { month: 'short', day: 'numeric' }),
            volume: totalVolume,
          };
        });
        setChartData(formattedData);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [user, language]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      {/* ヘッダー部分 (履歴ページと統一) */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-800 p-1 rounded-lg flex">
          <button 
            onClick={() => router.push('/history')}
            className="px-6 py-2 text-gray-400 hover:text-white font-bold text-sm transition-colors"
          >
            {t.history_title}
          </button>
          <button className="px-6 py-2 bg-blue-600 rounded text-white font-bold text-sm shadow-lg">
            {t.dashboard}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">{t.dashboard}</h1>
      
      {chartData.length < 2 ? (
        <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
          <p className="text-gray-400">{t.no_data_chart}</p>
        </div>
      ) : (
        <div className="bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700" style={{ width: '100%', height: 450 }}>
          <h2 className="text-lg font-semibold mb-6 text-blue-100 ml-2 border-l-4 border-blue-500 pl-3">
            {t.volume_chart_title}
          </h2>
          
          <ResponsiveContainer width="100%" height={350}>
            {/* AreaChartに変更して、よりリッチな見た目に */}
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                stroke="#9CA3AF" 
                tick={{ fontSize: 12 }} 
                tickMargin={10}
              />
              <YAxis 
                stroke="#9CA3AF" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => `${value / 1000}k`} // 1000単位で表示
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#E5E7EB', marginBottom: '0.5rem' }}
                itemStyle={{ color: '#60A5FA' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area 
                type="monotone" 
                dataKey="volume" 
                name={`${t.total_volume} (kg)`} 
                stroke="#3B82F6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorVolume)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}