'use client';

import { useState, useRef, useEffect } from 'react';

interface QuestionModalProps {
  exerciseName: string;
  onClose: () => void;
}

export default function QuestionModal({ exerciseName, onClose }: QuestionModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleSendQuestion = async () => {
    if (!question) return;
    setIsLoading(true);
    setAnswer('');
    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseName, question }),
      });
      if (!response.ok) throw new Error('AIからの応答エラー');
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      setAnswer('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ▼▼▼ 枠外クリックで閉じる機能 ▼▼▼
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // modalContentRef.currentが存在し、クリックされた場所がモーダルの中身(content)でなければ閉じる
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    // イベントリスナーを追加
    document.addEventListener('mousedown', handleClickOutside);
    // コンポーネントがアンマウントされるときにイベントリスナーを削除（メモリリーク防止）
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    // モーダルの背景
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      {/* モーダルの本体（コンテンツ部分）。refをここに設定 */}
      <div ref={modalContentRef} className="bg-gray-800 rounded-lg p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex-shrink-0">
            <h2 className="text-xl font-bold mb-2 text-white">AIに質問する</h2>
            <p className="text-gray-400 mb-4">
            種目: <span className="font-semibold text-white">{exerciseName}</span>
            </p>
        </div>

        {/* ▼▼▼ 質問フォームと回答エリアの順番を入れ替え ▼▼▼ */}
        
        {/* 質問入力フォーム (上に移動) */}
        <div className="flex gap-2 mb-4 flex-shrink-0">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例: 正しいフォームを教えて"
            // 文字色を白に指定
            className="flex-grow bg-gray-600 rounded p-2 text-white placeholder-gray-400"
          />
          <button onClick={handleSendQuestion} disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 rounded px-4 font-semibold disabled:bg-gray-500 text-white">
            送信
          </button>
        </div>
        
        {/* AIの回答表示エリア (下に移動し、スクロール可能に) */}
        <div className="bg-gray-700 p-4 rounded flex-grow overflow-y-auto">
          {isLoading ? (
            <p className="text-white">AIが考えています...</p> 
          ) : (
            // whitespace-pre-wrapで改行やスペースをそのまま表示
            <p className="text-white whitespace-pre-wrap">{answer || 'ここに回答が表示されます。'}</p>
          )}
        </div>

        <button onClick={onClose} className="w-full mt-4 bg-gray-600 hover:bg-gray-500 rounded p-2 flex-shrink-0 text-white font-semibold">
          閉じる
        </button>
      </div>
    </div>
  );
}