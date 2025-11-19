'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { Workout, Exercise, WorkoutSection } from '@/types';
import IntervalTimer from '@/components/features/workout/IntervalTimer';
import QuestionModal from '@/components/features/workout/QuestionModal';

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

export default function WorkoutPage() {
  const { user } = useAuth();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const router = useRouter();
  const [timerExpiry, setTimerExpiry] = useState<Date | null>(null);
  const [isChanging, setIsChanging] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const savedWorkoutJson = localStorage.getItem('currentWorkout');
    if (savedWorkoutJson) {
      setWorkout(JSON.parse(savedWorkoutJson));
    } else {
      router.push('/');
    }
  }, [router]);

  // 新しいデータ構造に対応した検索関数
  const findSetAndExercise = (workoutData: Workout, exerciseId: string, setId: string) => {
    for (const section of workoutData.sections) {
      const exercise = section.exercises.find((ex) => ex.id === exerciseId);
      if (exercise) {
        const set = exercise.sets.find((s) => s.id === setId);
        if (set) {
          return { section, exercise, set };
        }
      }
    }
    return { section: null, exercise: null, set: null };
  };

  const handleSetChange = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: number) => {
    if (!workout) return;
    const newWorkout: Workout = JSON.parse(JSON.stringify(workout));
    const { set } = findSetAndExercise(newWorkout, exerciseId, setId);
    if (set) {
      set[field] = value;
      setWorkout(newWorkout);
    }
  };

  const handleToggleSet = (exerciseId: string, setId: string) => {
    if (!workout) return;
    const newWorkout: Workout = JSON.parse(JSON.stringify(workout));
    const { set } = findSetAndExercise(newWorkout, exerciseId, setId);
    if (set) {
      set.isCompleted = !set.isCompleted;
      setWorkout(newWorkout);
      localStorage.setItem('currentWorkout', JSON.stringify(newWorkout));
      if (set.isCompleted) {
        const time = new Date();
        time.setSeconds(time.getSeconds() + 90);
        setTimerExpiry(time);
      } else {
        setTimerExpiry(null);
      }
    }
  };
  
  const handleCompleteWorkout = async () => {
    if (!workout || !user) return;
    // DBに保存するデータから 'menu' を削除し 'sections' を使う
    const workoutToSave = {
      user_id: user.id,
      date: workout.date,
      theme: workout.theme,
      reason: workout.reason,
      sections: workout.sections,
    };
    try {
      const { error } = await supabase.from('workouts').insert(workoutToSave);
      if (error) throw error;
      localStorage.removeItem('currentWorkout');
      alert('お疲れ様でした！今日のトレーニングを記録しました。');
      router.push('/history');
    } catch (err: any) {
      // menu列がない、というエラーに対応
      if (err.message.includes('column "menu" of relation "workouts" does not exist')) {
        alert('データベースの構造が古いようです。一度Supabaseのworkoutsテーブルを削除し、再作成してください。');
      } else {
        console.error('記録の保存に失敗しました:', err);
        alert('記録の保存に失敗しました。');
      }
    }
  };

  const handleChangeExerciseRequest = async (exercise: Exercise) => {
    setIsChanging(exercise.id);
    setAlternatives([]);
    try {
      const response = await fetch('/api/change-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseName: exercise.name }),
      });
      if (!response.ok) throw new Error('AIからの応答エラー');
      const data: string[] = await response.json();
      setAlternatives(data);
    } catch (error) {
      alert('代替種目の取得に失敗しました。');
      setIsChanging(null);
    }
  };

  const handleSelectAlternative = (exerciseId: string, newName: string) => {
    if (!workout) return;
    const newWorkout: Workout = JSON.parse(JSON.stringify(workout));
    for (const section of newWorkout.sections) {
      const exercise = section.exercises.find((ex) => ex.id === exerciseId);
      if (exercise) {
        exercise.name = newName;
        break; // 見つけたらループを抜ける
      }
    }
    setWorkout(newWorkout);
    setIsChanging(null);
    setAlternatives([]);
  };

  const handleOpenModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  if (!workout) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">読み込み中...</div>;
  }

  return (
    <>
      <main className="min-h-screen bg-gray-900 text-white p-4 pb-24">
        <div className="mb-8 p-4 bg-gray-800 rounded-lg shadow-lg">
          {/* ▼▼▼ formatDate関数を使ってテーマと日付を表示 ▼▼▼ */}
          <h1 className="text-3xl font-bold text-center text-white">{workout.theme}</h1>
          <p className="text-center text-gray-400 mt-2">{formatDate(workout.date)}</p>
          <p className="text-gray-300 mt-3 text-center leading-relaxed">{workout.reason}</p>
        </div>

        <div className="space-y-8">
          {workout.sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="text-2xl font-semibold mb-4 border-b-2 border-blue-500 pb-2 text-white">{section.title}</h2>
              <div className="space-y-6">
                {section.exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-white">{exercise.name}</h3>
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenModal(exercise)} disabled={!!isChanging} className="text-sm bg-purple-600 hover:bg-purple-500 text-white py-1 px-3 rounded-md disabled:opacity-50">質問</button>
                        <button onClick={() => handleChangeExerciseRequest(exercise)} disabled={!!isChanging} className="text-sm bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded-md disabled:bg-gray-700 disabled:cursor-not-allowed">{isChanging === exercise.id ? '...' : '変更'}</button>
                      </div>
                    </div>

                    {isChanging === exercise.id && alternatives.length > 0 && (
                      <div className="mb-4 bg-gray-700 p-3 rounded-md">
                        <p className="text-sm text-gray-300 mb-2">AIからの代替案:</p>
                        <div className="flex flex-wrap gap-2">
                          {alternatives.map((altName) => (<button key={altName} onClick={() => handleSelectAlternative(exercise.id, altName)} className="bg-blue-500 hover:bg-blue-400 text-white text-xs py-1 px-2 rounded">{altName}</button>))}
                          <button onClick={() => { setIsChanging(null); setAlternatives([]); }} className="bg-red-500 hover:bg-red-400 text-white text-xs py-1 px-2 rounded">×</button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {exercise.sets.map((set, index) => (
                        <div key={set.id} className={`flex items-center justify-between p-2 rounded ${set.isCompleted ? 'bg-green-800' : 'bg-gray-700'}`}>
                          <span className="font-semibold text-white">{index + 1} set</span>
                          <div className="flex items-center gap-2">
                            <input type="number" value={set.weight} onChange={(e) => handleSetChange(exercise.id, set.id, 'weight', Number(e.target.value))} className="w-20 bg-gray-600 text-center rounded p-1 text-white"/>
                            <span className="text-gray-400">kg</span>
                            <span className="text-gray-400">×</span>
                            <input type="number" value={set.reps} onChange={(e) => handleSetChange(exercise.id, set.id, 'reps', Number(e.target.value))} className="w-20 bg-gray-600 text-center rounded p-1 text-white"/>
                            <span className="text-gray-400">reps</span>
                          </div>
                          <button onClick={() => handleToggleSet(exercise.id, set.id)} className={`font-bold py-1 px-3 rounded w-20 text-center text-white ${set.isCompleted ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'}`}>{set.isCompleted ? '取消' : '完了'}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <button onClick={handleCompleteWorkout} className="w-full mt-12 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg">今日のトレーニングを記録する</button>
      </main>

      {timerExpiry && (<IntervalTimer key={timerExpiry.getTime()} expiryTimestamp={timerExpiry} onExpire={() => setTimerExpiry(null)}/>)}
      {isModalOpen && selectedExercise && (<QuestionModal exerciseName={selectedExercise.name} onClose={() => setIsModalOpen(false)}/>)}
    </>
  );
}