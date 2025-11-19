'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

// Contextが保持するデータの型を定義
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

// Contextオブジェクトを作成
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
});

// アプリ全体に認証情報を提供するコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // 最初に現在のセッション情報を取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 認証状態が変化（ログイン、ログアウトなど）するたびに呼ばれるリスナー
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // クリーンアップ関数
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 他のコンポーネントから簡単に認証情報を使えるようにするカスタムフック
export const useAuth = () => {
  return useContext(AuthContext);
};