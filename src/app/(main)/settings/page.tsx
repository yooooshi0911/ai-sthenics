'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLanguage } from '@/context/LanguageContext'; // ← グローバル設定を使う
import { Language } from '@/lib/i18n'; // 型だけインポート

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // ▼▼▼ グローバルの言語設定を取得 ▼▼▼
  const { language, setLanguage, t } = useLanguage(); 

  const [goal, setGoal] = useState('muscle_hypertrophy');
  const [level, setLevel] = useState('intermediate');
  const [personalInfo, setPersonalInfo] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 現在の設定を読み込む
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        // languageはContextが管理するので、ここでは取得不要（または無視）
        const { data, error } = await supabase
          .from('profiles')
          .select('goal, level, personal_info')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setGoal(data.goal || 'muscle_hypertrophy');
          setLevel(data.level || 'intermediate');
          setPersonalInfo(data.personal_info || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // 設定を保存する
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        // languageはsetLanguageで既に保存されているので、ここでは送らなくてOK
        // （念のため送っても問題はないですが、二重更新になります）
        .update({ 
          goal, 
          level,
          personal_info: personalInfo,
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Saved!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <h1 className="text-3xl font-bold mb-8 text-center">{t.settings_title}</h1>

      <div className="max-w-md mx-auto space-y-8">
        <section className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2 text-blue-100">{t.settings_title}</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Language / 言語
              </label>
              <select 
                value={language} 
                // ▼▼▼ グローバルの言語を変更する（DB保存も自動で行われる） ▼▼▼
                onChange={(e) => setLanguage(e.target.value as Language)} 
                className="w-full bg-gray-700 rounded p-3 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="ja">日本語 (Japanese)</option>
                <option value="it">Italiano (Italian)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {t.goal_label}
              </label>
              <select 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)} 
                className="w-full bg-gray-700 rounded p-3 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="muscle_hypertrophy">{t.muscle_hypertrophy}</option>
                <option value="strength">{t.strength}</option>
                <option value="diet">{t.diet}</option>
                <option value="health">{t.health}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {t.level_label}
              </label>
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)} 
                className="w-full bg-gray-700 rounded p-3 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="beginner">{t.beginner}</option>
                <option value="intermediate">{t.intermediate}</option>
                <option value="advanced">{t.advanced}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {t.personal_info_label}
              </label>
              <textarea
                value={personalInfo}
                onChange={(e) => setPersonalInfo(e.target.value)}
                placeholder="..."
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm h-32 resize-none"
              />
            </div>

            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSaving ? '...' : t.save_changes}
            </button>
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2 text-red-100">{t.account}</h2>
          <button onClick={handleLogout} className="w-full bg-red-600/80 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95">
            {t.logout}
          </button>
        </section>
      </div>
    </div>
  );
}