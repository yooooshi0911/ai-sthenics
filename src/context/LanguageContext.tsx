'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { translations, Language } from '@/lib/i18n';

// Contextの型定義
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.ja; // 翻訳辞書データ
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ja',
  setLanguage: () => {},
  t: translations.ja,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('ja');

  // ログイン時にDBから言語設定を取得
  useEffect(() => {
    const fetchLanguage = async () => {
      if (user) {
        const { data } = await supabase.from('profiles').select('language').eq('id', user.id).single();
        if (data?.language) {
          setLanguageState(data.language as Language);
        }
      }
    };
    fetchLanguage();
  }, [user]);

  // 言語を変更する関数（DB保存も同時に行う）
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang); // まず画面を更新
    if (user) {
      await supabase.from('profiles').update({ language: lang }).eq('id', user.id); // 裏でDB更新
    }
  };

  const value = {
    language,
    setLanguage,
    t: translations[language], // 現在の言語の辞書を渡す
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  return useContext(LanguageContext);
};