'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { Workout } from '@/types';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/i18n';

// 1RM計算関数 (Epley Formula)
const calculateOneRM = (weight: number, reps: number) => {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  // Epley: w * (1 + r/30)
  return Math.round(weight * (1 + reps / 30));
};

export default function HistoryDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        router.push('/history');
      } else {
        setWorkout(data);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [user, id, router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const localeMap = { ja: 'ja-JP', en: 'en-US', it: 'it-IT' };
    return new Intl.DateTimeFormat(localeMap[language] || 'ja-JP', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    }).format(date);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete?')) {
      return;
    }
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('workouts').delete().eq('id', id);
      if (error) throw error;
      alert('Deleted.');
      router.refresh();
      router.push('/history');
    } catch (err) {
      alert('Failed.');
      setIsDeleting(false);
    }
  };

  if (isLoading || !workout) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24 font-sans">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="text-gray-400 hover:text-white mb-4 text-sm flex items-center gap-1 transition-colors"
        >
          ← {t.back}
        </button>
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">{formatDate(workout.date)}</p>
          <h1 className="text-2xl font-bold text-blue-100">{workout.theme}</h1>
          <p className="text-gray-300 mt-3 text-sm leading-relaxed">{workout.reason}</p>
        </div>
      </div>

      <div className="space-y-6">
        {workout.sections.map((section, index) => (
          <div key={index}>
            <h2 className="text-lg font-bold mb-3 text-gray-400 border-l-4 border-blue-500 pl-3">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.exercises.map((exercise) => {
                // その種目での最大推定1RMを計算
                const maxOneRM = Math.max(...exercise.sets.map(s => calculateOneRM(s.weight, s.reps)));

                return (
                  <div key={exercise.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700/50">
                    <div className="flex justify-between items-end mb-3">
                      <h3 className="font-bold text-white text-lg leading-tight">{exercise.name}</h3>
                      {/* ▼▼▼ 推定1RMの表示 ▼▼▼ */}
                      {maxOneRM > 0 && (
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Est. 1RM</span>
                          <span className="text-lg font-bold text-purple-400">{maxOneRM} <span className="text-xs">kg</span></span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      {exercise.sets.map((set, idx) => {
                        const setOneRM = calculateOneRM(set.weight, set.reps);
                        // ベスト記録のセットを強調表示
                        const isBestSet = setOneRM === maxOneRM && maxOneRM > 0;

                        return (
                          <div key={set.id} className={`flex justify-between items-center text-sm border-b border-gray-700/50 last:border-0 py-2 ${isBestSet ? 'bg-purple-900/20 -mx-2 px-2 rounded' : ''}`}>
                            <span className="text-gray-500 w-6 font-mono">{idx + 1}</span>
                            <div className="flex-1 flex items-baseline gap-1 justify-center">
                              <span className="text-white font-bold text-base">{set.weight > 0 ? set.weight : '-'}</span>
                              <span className="text-xs text-gray-500">kg</span>
                            </div>
                            <span className="text-gray-600 text-xs mx-2">×</span>
                            <div className="flex-1 flex items-baseline gap-1 justify-center">
                              <span className="text-white font-bold text-base">{set.reps}</span>
                              <span className="text-xs text-gray-500">reps</span>
                            </div>
                            <div className="w-16 text-right">
                              {set.isCompleted ? (
                                isBestSet ? (
                                  <span className="text-xs font-bold text-purple-400 border border-purple-500/50 px-1.5 py-0.5 rounded">MAX</span>
                                ) : (
                                  <span className="text-green-500">✔</span>
                                )
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-400 hover:text-red-300 border border-red-900/50 hover:bg-red-900/20 px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <span>🗑️</span>
          {isDeleting ? '...' : t.delete_history}
        </button>
      </div>
    </div>
  );
}