'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { translations, Language } from '@/lib/i18n';
import { useLanguage } from '@/context/LanguageContext'; // ← これを使う！

export default function Header() {
  const { user } = useAuth();
  const { t } = useLanguage(); // ← これだけで常に最新の翻訳データが取れる！

  
  return (
    <header className="sticky top-0 z-50 bg-gray-800 p-4 shadow-md">
      <nav className="flex justify-between items-center px-4 max-w-md mx-auto">
        <Link href="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
          AI-STHENICS
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            <Link href="/history" className="text-gray-300 hover:text-white transition-colors text-sm flex flex-col items-center">
              <span>📊</span>
              <span>{t.history_analysis}</span>
            </Link>

            <Link href="/settings" className="text-gray-300 hover:text-white transition-colors text-sm flex flex-col items-center">
              <span>⚙️</span>
              <span>{t.settings}</span>
            </Link>
          </div>
        )}
        
        {!user && (
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
            {t.login}
          </Link>
        )}
      </nav>
    </header>
  );
}