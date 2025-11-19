'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // 初期値は具体的な値をセットしておく（空文字だとselectの表示が崩れることがあるため）
  const [goal, setGoal] = useState('muscle_hypertrophy');
  const [level, setLevel] = useState('intermediate');
  const [personalInfo, setPersonalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // 保存中のローディング

  // 現在の設定を読み込む
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('goal, level, personal_info')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          console.log("Fetched Profile:", data); // デバッグ用ログ
          setGoal(data.goal || 'muscle_hypertrophy');
          setLevel(data.level || 'intermediate');
          setPersonalInfo(data.personal_info || '');
        }
      } catch (err) {
        console.error("プロフィールの取得に失敗:", err);
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
      console.log("Updating with:", { goal, level, personalInfo }); // デバッグ用ログ

      const { error } = await supabase
        .from('profiles')
        .update({ 
          goal: goal, 
          level: level,
          personal_info: personalInfo 
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('設定を更新しました！');
    } catch (err: any) {
      console.error("更新エラー詳細:", err);
      alert(`更新に失敗しました: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-pulse">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <h1 className="text-3xl font-bold mb-8 text-center">設定</h1>

      <div className="max-w-md mx-auto space-y-8">
        <section className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2 text-blue-100">トレーニング設定</h2>
          
          <div className="space-y-6">
            {/* 目標設定 */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                主な目標
              </label>
              <select 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)} 
                className="w-full bg-gray-700 rounded p-3 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="muscle_hypertrophy">筋肥大（筋肉を大きくしたい）</option>
                <option value="strength">筋力向上（重いものを持ちたい）</option>
                <option value="diet">ダイエット（脂肪を燃やしたい）</option>
                <option value="health">健康維持（運動不足解消）</option>
              </select>
            </div>

            {/* レベル設定 */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                トレーニング経験
              </label>
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)} 
                className="w-full bg-gray-700 rounded p-3 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="beginner">初心者（～6ヶ月）</option>
                <option value="intermediate">中級者（6ヶ月～2年）</option>
                <option value="advanced">上級者（2年以上）</option>
              </select>
            </div>

            {/* パーソナル情報 */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                パーソナル情報・AIへの指示
              </label>
              <p className="text-xs text-gray-400 mb-2">
                怪我の情報、持病、苦手な種目、強化したい部位など。
              </p>
              <textarea
                value={personalInfo}
                onChange={(e) => setPersonalInfo(e.target.value)}
                placeholder="例：腰痛持ちなのでデッドリフトは控えたい。"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm h-32 resize-none"
              />
            </div>

            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSaving ? '保存中...' : '変更を保存'}
            </button>
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2 text-red-100">アカウント</h2>
          <button onClick={handleLogout} className="w-full bg-red-600/80 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95">
            ログアウト
          </button>
        </section>
      </div>
    </div>
  );
}