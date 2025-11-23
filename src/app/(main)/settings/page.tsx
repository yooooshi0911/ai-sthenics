'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/i18n';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const [goal, setGoal] = useState('muscle_hypertrophy');
  const [level, setLevel] = useState('intermediate');
  const [personalInfo, setPersonalInfo] = useState('');
  
  // 純正タイマー設定 (初期値false)
  const [useNativeTimer, setUseNativeTimer] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 読み込み処理
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        // LocalStorageから読み込み
        const savedNativeTimer = localStorage.getItem('useNativeTimer');
        if (savedNativeTimer === 'true') setUseNativeTimer(true);

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

  // ▼▼▼ 修正: useNativeTimerが変更されたら即座にLocalStorageへ保存 ▼▼▼
  useEffect(() => {
    localStorage.setItem('useNativeTimer', String(useNativeTimer));
  }, [useNativeTimer]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
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
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center tracking-wide">{t.settings_title}</h1>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* トレーニング設定 */}
        <section className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2 text-blue-100">
            {t.training_settings_title}
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{t.goal_label}</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-gray-900/80 rounded-xl p-3 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all">
                <option value="muscle_hypertrophy">{t.muscle_hypertrophy}</option>
                <option value="strength">{t.strength}</option>
                <option value="diet">{t.diet}</option>
                <option value="health">{t.health}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{t.level_label}</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-gray-900/80 rounded-xl p-3 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all">
                <option value="beginner">{t.beginner}</option>
                <option value="intermediate">{t.intermediate}</option>
                <option value="advanced">{t.advanced}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{t.personal_info_label}</label>
              <textarea value={personalInfo} onChange={(e) => setPersonalInfo(e.target.value)} className="w-full bg-gray-900/80 border border-gray-600 text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm h-32 resize-none transition-all" />
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center gap-2">
              {isSaving ? 'Saving...' : t.save_changes}
            </button>
          </div>
        </section>

        {/* アプリ設定 */}
        <section className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2 text-purple-100">
            {t.app_settings_title}
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Language / 言語</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="w-full bg-gray-900/80 rounded-xl p-3 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none transition-all">
                <option value="ja">日本語 (Japanese)</option>
                <option value="it">Italiano (Italian)</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* ▼▼▼ 純正タイマー設定スイッチ ▼▼▼ */}
            <div className="pt-4 border-t border-gray-700/50">
              <label className="flex items-center justify-between cursor-pointer group py-2">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-bold text-gray-200 mb-1">{t.native_timer_label}</span>
                  <span className="text-[10px] text-gray-400 leading-tight">{t.native_timer_desc}</span>
                </div>
                <div className="relative flex-shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={useNativeTimer}
                    onChange={(e) => setUseNativeTimer(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
              </label>
              
              {/* ▼▼▼ ショートカット導入案内（常時表示またはON時のみ表示） ▼▼▼ */}
              {useNativeTimer && (
                <div className="mt-3 text-xs text-blue-200/90 bg-blue-900/30 p-3 rounded-lg border border-blue-500/30 animate-fade-in">
                  <p className="mb-3 font-bold">{t.native_timer_warning}</p>
                  <a 
                    href="https://www.icloud.com/shortcuts/4e24423cfe8c4a3fb008f3cae7e3656f" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    <span>📥</span> {t.shortcut_link_text}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* アカウント */}
        <section className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2 text-red-100">{t.account}</h2>
          <button onClick={handleLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 font-bold py-3 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2">
            {t.logout}
          </button>
        </section>

      </div>
    </div>
  );
}