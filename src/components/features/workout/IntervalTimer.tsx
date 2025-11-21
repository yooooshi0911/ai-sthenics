'use client';

import { useTimer } from 'react-timer-hook';
import { useEffect } from 'react';

interface IntervalTimerProps {
  expiryTimestamp: Date;
  onExpire: () => void;
  onClose: () => void; // キャンセル用の関数を追加
}

export default function IntervalTimer({ expiryTimestamp, onExpire, onClose }: IntervalTimerProps) {
  const { seconds, minutes, restart } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      // ▼▼▼ 通知の発火ロジック ▼▼▼
      sendNotification();
      onExpire();
    },
  });

  // propsの時間が変わったらタイマーを再始動する
  useEffect(() => {
    restart(expiryTimestamp);
  }, [expiryTimestamp, restart]);

  const sendNotification = () => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        // 1. まず標準のNotification APIを試す（iOS 16.4+ PWAはこれで動くことが多い）
        new Notification('インターバル終了！', {
          body: '次のセットを始めましょう💪',
          icon: '/icons/icon-192x192.png',
        });

        // 2. Service Worker経由も念のため試す（Androidなど）
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification('インターバル終了！', {
              body: '次のセットを始めましょう💪',
              icon: '/icons/icon-192x192.png',
              tag: 'interval-timer',
            });
          });
        }
      } catch (e) {
        console.error('通知エラー:', e);
      }
    }
  };

  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');

  return (
    <div className="fixed bottom-24 right-4 bg-blue-600 text-white p-4 rounded-xl shadow-2xl z-50 animate-bounce-in border border-blue-400/30 min-w-[140px]">
      {/* ▼▼▼ 閉じるボタン ▼▼▼ */}
      <button 
        onClick={onClose}
        className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md"
      >
        ✕
      </button>

      <p className="text-center font-mono text-4xl font-bold tracking-wider">
        {formattedMinutes}:{formattedSeconds}
      </p>
      <p className="text-center text-[10px] mt-1 opacity-80 uppercase tracking-widest">Rest Time</p>
    </div>
  );
}