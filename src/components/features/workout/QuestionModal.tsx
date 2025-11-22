'use client';

import { useState, useRef, useEffect } from 'react';
import { translations, Language } from '@/lib/i18n';
import ReactMarkdown from 'react-markdown';

interface QuestionModalProps {
  exerciseName: string;
  onClose: () => void;
  language: Language;
}

export default function QuestionModal({ exerciseName, onClose, language }: QuestionModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  const handleSendQuestion = async () => {
    if (!question || isLoading) return;
    setIsLoading(true);
    setAnswer('');
    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          exerciseName, 
          question,
          language 
        }),
      });
      if (!response.ok) throw new Error('AI Error');
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      setAnswer(t.ai_error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) { // ローディング中はEnterも無効化
      handleSendQuestion();
    }
  };
  
  useEffect(() => {
    // ▼▼▼ 背景スクロールの固定 ▼▼▼
    // モーダルが開いた瞬間に body の overflow を hidden にする
    document.body.style.overflow = 'hidden';

    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // クリーンアップ関数：モーダルが閉じる時に元に戻す
    return () => {
      document.body.style.overflow = 'unset'; // スクロールを許可
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      
      <div 
        ref={modalContentRef} 
        className="relative w-full max-w-lg flex flex-col max-h-[85vh] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(37,99,235,0.2)] overflow-hidden bg-gray-900/90"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 pointer-events-none"></div>

        <div className="relative flex flex-col h-full p-6">
          
          <div className="flex-shrink-0 mb-6">
            <h2 className="text-xl font-bold text-white tracking-wide mb-1">{t.ask_modal_title}</h2>
            <p className="text-sm text-blue-200/70">
              {t.exercise_label}: <span className="font-bold text-blue-100 ml-1 border-b border-blue-500/30 pb-0.5">{exerciseName}</span>
            </p>
          </div>

          <div className="flex gap-2 mb-4 flex-shrink-0">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.question_placeholder}
              disabled={isLoading} // ▼▼▼ ローディング中は入力不可 ▼▼▼
              className="flex-grow bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              onClick={handleSendQuestion} 
              disabled={isLoading} 
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl px-5 font-bold text-sm shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 whitespace-nowrap"
            >
              {isLoading ? '...' : t.send}
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar rounded-xl bg-black/20 border border-white/5 p-4 min-h-[150px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full space-x-2 text-blue-300/70">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              </div>
            ) : answer ? (
              <div className="text-gray-100 text-sm leading-relaxed space-y-3">
                <ReactMarkdown
                  components={{
                    strong: ({node, ...props}) => <span className="font-bold text-blue-300" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside pl-1 my-2 space-y-1 text-gray-300 marker:text-blue-500" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside pl-1 my-2 space-y-1 text-gray-300 marker:text-blue-500" {...props} />,
                    h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-4 mb-2 text-blue-200 border-b border-blue-500/30 pb-1" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-1 text-blue-200" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  }}
                >
                  {answer}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500/50 text-sm italic">
                {t.answer_placeholder}
              </div>
            )}
          </div>

          <button 
            onClick={onClose} 
            className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-gray-300 text-sm font-medium transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}