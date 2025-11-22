'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { Workout, Exercise } from '@/types';
import IntervalTimer from '@/components/features/workout/IntervalTimer';
import QuestionModal from '@/components/features/workout/QuestionModal';
import confetti from 'canvas-confetti';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLanguage } from '@/context/LanguageContext'; // ← グローバル設定を使う

export default function WorkoutPage() {
  const { user } = useAuth();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const router = useRouter();
  const [timerExpiry, setTimerExpiry] = useState<Date | null>(null);
  const [isChanging, setIsChanging] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // ▼▼▼ グローバルの言語設定を取得 ▼▼▼
  const { language, t } = useLanguage(); 
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const savedWorkoutJson = localStorage.getItem('currentWorkout');
    if (savedWorkoutJson) {
      setWorkout(JSON.parse(savedWorkoutJson));
    } else {
      router.push('/');
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [router]);

  const requestNotification = async () => {
    if (!('Notification' in window)) {
      alert('Not supported.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      alert(t.notification_q.replace('?', '!'));
    }
  };

  const findSetAndExercise = (workoutData: Workout, exerciseId: string, setId: string) => {
    for (const section of workoutData.sections) {
      const exercise = section.exercises.find((ex) => ex.id === exerciseId);
      if (exercise) {
        const set = exercise.sets.find((s) => s.id === setId);
        if (set) return { set };
      }
    }
    return { set: null };
  };

  const handleSetChange = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    if (!workout) return;
    const newWorkout: Workout = JSON.parse(JSON.stringify(workout));
    const { set } = findSetAndExercise(newWorkout, exerciseId, setId);
    
    if (set) {
      if (value === '') {
        (set as any)[field] = ''; 
      } else {
        (set as any)[field] = Number(value);
      }
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

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    await new Promise(resolve => setTimeout(resolve, 1500));

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
      alert('Good job!');
      router.push('/history');
    } catch (err: any) {
       if (err.message.includes('column "menu"')) {
         alert('DB Error: Table schema mismatch.');
       } else {
         console.error(err);
         alert('Save failed.');
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
        body: JSON.stringify({ 
          exerciseName: exercise.name,
          language: language // ▼▼▼ APIに言語設定を送る ▼▼▼
        }),
      });
      if (!response.ok) throw new Error('Error');
      const data: string[] = await response.json();
      setAlternatives(data);
    } catch (error) {
      alert('Failed to get alternatives.');
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
        break;
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
    return <LoadingScreen />;
  }

  return (
    <>
      <main className="min-h-screen bg-gray-950 text-white p-4 pb-32 font-sans">
        
        {notificationPermission === 'default' && (
          <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded-xl flex justify-between items-center animate-fade-in">
            <span className="text-xs text-blue-200">{t.notification_q}</span>
            <button 
              onClick={requestNotification}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg font-bold shadow-lg transition-transform active:scale-95"
            >
              {t.allow}
            </button>
          </div>
        )}

        <div className="mb-6 p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg border border-gray-700/50">
          <h1 className="text-xl font-bold text-center text-blue-100">{workout.theme}</h1>
          <p className="text-gray-400 mt-2 text-center text-xs leading-relaxed">{workout.reason}</p>
        </div>

        <div className="space-y-8">
          {workout.sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h2 className="text-lg font-bold mb-3 text-gray-400 flex items-center">
                <span className="w-1 h-4 bg-blue-500 mr-2 rounded-full"></span>
                {section.title}
              </h2>
              
              <div className="space-y-4">
                {section.exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-white leading-tight flex-1 mr-2">{exercise.name}</h3>
                      <div className="flex gap-3">
                        <button onClick={() => handleOpenModal(exercise)} className="text-purple-400 hover:text-purple-300 text-xs font-medium flex items-center gap-1">
                          <span>💡</span>{t.ask}
                        </button>
                        <button onClick={() => handleChangeExerciseRequest(exercise)} disabled={!!isChanging} className="text-gray-400 hover:text-gray-300 text-xs font-medium flex items-center gap-1">
                          <span>🔄</span>{isChanging === exercise.id ? '...' : t.change}
                        </button>
                      </div>
                    </div>

                    {isChanging === exercise.id && alternatives.length > 0 && (
                      <div className="mb-4 bg-gray-800 p-3 rounded-xl border border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">AI suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                          {alternatives.map((altName) => (
                            <button key={altName} onClick={() => handleSelectAlternative(exercise.id, altName)} className="bg-blue-600/20 text-blue-200 hover:bg-blue-600/40 text-xs py-1 px-3 rounded-full border border-blue-500/30 transition-colors">
                              {altName}
                            </button>
                          ))}
                          <button onClick={() => { setIsChanging(null); setAlternatives([]); }} className="text-gray-400 hover:text-white px-2">×</button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-[30px_1fr_1fr_50px] gap-2 text-xs text-gray-500 text-center mb-1 uppercase tracking-wider">
                        <span>{t.set}</span>
                        <span>{t.kg}</span>
                        <span>{t.reps}</span>
                        <span>{t.done}</span>
                      </div>

                      {exercise.sets.map((set, index) => (
                        <div 
                          key={set.id} 
                          className={`grid grid-cols-[30px_1fr_1fr_50px] gap-2 items-center py-2 rounded-xl transition-colors duration-200 ${
                            set.isCompleted ? 'bg-green-900/20' : 'bg-gray-800/50'
                          }`}
                        >
                          <div className="text-center text-gray-500 font-mono text-sm">{index + 1}</div>

                          <div className="relative flex justify-center">
                            <input 
                              type="number" 
                              value={(set.weight === 0 || set.weight === undefined || isNaN(set.weight)) && (set as any).weight !== 0 ? '' : set.weight} 
                              onChange={(e) => handleSetChange(exercise.id, set.id, 'weight', e.target.value)} 
                              className={`w-full bg-transparent text-center text-xl font-bold focus:outline-none ${set.isCompleted ? 'text-green-400' : 'text-white'}`}
                              placeholder="0"
                            />
                          </div>

                          <div className="relative flex justify-center">
                            <input 
                              type="number" 
                              value={(set.reps === 0 || set.reps === undefined || isNaN(set.reps)) && (set as any).reps !== 0 ? '' : set.reps} 
                              onChange={(e) => handleSetChange(exercise.id, set.id, 'reps', e.target.value)} 
                              className={`w-full bg-transparent text-center text-xl font-bold focus:outline-none ${set.isCompleted ? 'text-green-400' : 'text-white'}`}
                              placeholder="0"
                            />
                          </div>

                          <div className="flex justify-center">
                            <button
                              onClick={() => handleToggleSet(exercise.id, set.id)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                                set.isCompleted 
                                  ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)] scale-105' 
                                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              }`}
                            >
                              {set.isCompleted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="block w-3 h-3 rounded-sm border-2 border-gray-500/50"></span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 px-4 flex justify-center">
          <button 
            onClick={handleCompleteWorkout}
            className="w-full max-w-md bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>🎉</span>
            <span>{t.complete_workout}</span>
          </button>
        </div>
      </main>

      {timerExpiry && (
        <IntervalTimer
          key={timerExpiry.getTime()}
          expiryTimestamp={timerExpiry}
          onExpire={() => setTimerExpiry(null)}
          onClose={() => setTimerExpiry(null)}
        />
      )}
      {isModalOpen && selectedExercise && (
        <QuestionModal 
          exerciseName={selectedExercise.name}
          onClose={() => setIsModalOpen(false)}
          language={language} // ▼▼▼ 言語設定を渡す ▼▼▼
        />
      )}
    </>
  );
}