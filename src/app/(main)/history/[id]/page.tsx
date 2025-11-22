'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { Workout } from '@/types';
import LoadingScreen from '@/components/common/LoadingScreen';
import { translations, Language } from '@/lib/i18n';

export default function HistoryDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [language, setLanguage] = useState<Language>('ja');

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;
      
      // 言語取得
      const { data: profile } = await supabase.from('profiles').select('language').eq('id', user.id).single();
      if (profile?.language) setLanguage(profile.language as Language);

      // 履歴取得
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

  const t = translations[language];

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
      
      // ▼▼▼ 修正: refreshを追加してデータを最新にする ▼▼▼
      router.refresh(); 
      router.push('/history');
      // ▲▲▲ ここまで ▲▲▲
    } catch (err) {
      alert('Failed.');
      setIsDeleting(false);
    }
  };

  if (isLoading || !workout) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="text-gray-400 hover:text-white mb-4 text-sm flex items-center gap-1"
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
              {section.exercises.map((exercise) => (
                <div key={exercise.id} className="bg-gray-800 p-4 rounded-xl">
                  <h3 className="font-bold text-white mb-2">{exercise.name}</h3>
                  <div className="space-y-1">
                    {exercise.sets.map((set, idx) => (
                      <div key={set.id} className="flex justify-between text-sm border-b border-gray-700 last:border-0 py-2">
                        <span className="text-gray-500 w-8">{idx + 1}</span>
                        <span className="text-white font-mono flex-1 text-center">
                          {set.weight > 0 ? `${set.weight}kg` : '-'}
                        </span>
                        <span className="text-gray-400">×</span>
                        <span className="text-white font-mono flex-1 text-center">
                          {set.reps} {t.reps}
                        </span>
                        <span className="w-8 text-right">
                          {set.isCompleted ? '✅' : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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