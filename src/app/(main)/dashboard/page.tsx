'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { WorkoutSection } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ▼▼▼ カレンダー用ライブラリ ▼▼▼
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isSameDay, parseISO } from 'date-fns';
import { ja, enUS, it } from 'date-fns/locale';

interface WorkoutData {
    id: string;
    date: string;
    theme: string; // テーマも取得
    sections: WorkoutSection[];
}

interface ChartData {
  date: string;
  displayDate: string;
  volume: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [rawData, setRawData] = useState<WorkoutData[]>([]); // カレンダー用に元データも保持
  const [isLoading, setIsLoading] = useState(true);
  
  // ▼▼▼ 選択された日付 ▼▼▼
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);

      // theme と id も取得するように変更
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('id, date, theme, sections') 
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .returns<WorkoutData[]>();

      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }

      if (workouts) {
        setRawData(workouts); // 元データを保存

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

  // ▼▼▼ カレンダー設定 ▼▼▼
  // ユーザーの言語に合わせてカレンダーのロケールを選択
  const dateFnsLocale = language === 'ja' ? ja : language === 'it' ? it : enUS;

  // トレーニングした日を抽出（Dateオブジェクトに変換）
  const workoutDays = rawData.map(w => parseISO(w.date));

  // 選択された日のトレーニングデータを検索
  const selectedWorkouts = rawData.filter(w => 
    selectedDate && isSameDay(parseISO(w.date), selectedDate)
  );

  // 今月のトレーニング回数を計算
  const currentMonthWorkouts = rawData.filter(w => {
    const d = parseISO(w.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
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

      {/* ▼▼▼ カレンダーセクション ▼▼▼ */}
      <div className="bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-purple-100 ml-2 border-l-4 border-purple-500 pl-3 flex justify-between items-center">
          <span>{t.calendar_title}</span>
          <span className="text-xs font-normal text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
            {t.monthly_count}: <strong className="text-white">{currentMonthWorkouts.length}</strong> {t.times}
          </span>
        </h2>

        <div className="flex justify-center">
          {/* カレンダー本体 */}
          <style>{`
            .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #9333ea; --rdp-background-color: #3b82f6; margin: 0; }
            .rdp-day_selected:not([disabled]) { background-color: var(--rdp-background-color); color: white; font-weight: bold; }
            .rdp-day_today { color: #60a5fa; font-weight: bold; }
            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #374151; }
          `}</style>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ trained: workoutDays }}
            modifiersStyles={{
              trained: { 
                border: '2px solid #9333ea', // トレーニングした日は紫の枠線
                fontWeight: 'bold'
              }
            }}
            locale={dateFnsLocale}
            className="text-white bg-gray-900/50 p-4 rounded-xl"
          />
        </div>

        {/* ▼ 選択した日の詳細表示エリア ▼ */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">
            {selectedDate ? format(selectedDate, 'yyyy/MM/dd') : ''}
          </p>
          
          {selectedWorkouts.length > 0 ? (
            <div className="space-y-2">
              {selectedWorkouts.map(workout => (
                <Link href={`/history/${workout.id}`} key={workout.id} className="block">
                  <div className="bg-gray-700/50 hover:bg-gray-700 p-3 rounded-lg flex justify-between items-center transition-colors border border-gray-600">
                    <span className="font-bold text-white">{workout.theme}</span>
                    <span className="text-gray-400 text-sm">›</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">{t.no_workout_day}</p>
          )}
        </div>
      </div>

      {/* ▼▼▼ グラフセクション (変更なし) ▼▼▼ */}
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
                tickFormatter={(value) => `${value / 1000}k`}
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