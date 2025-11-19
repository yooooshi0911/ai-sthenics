'use client';

import { useTimer } from 'react-timer-hook';

// このコンポーネントが受け取る情報の型を定義
interface IntervalTimerProps {
  expiryTimestamp: Date; // タイマーが終了する時刻
  onExpire: () => void; // タイマーが終了したときに呼ばれる関数
}

export default function IntervalTimer({ expiryTimestamp, onExpire }: IntervalTimerProps) {
  const { seconds, minutes } = useTimer({
    expiryTimestamp,
    onExpire, // 0秒になったらonExpireを実行
  });

  // 1桁の場合は0を付けて表示 (例: 5秒 → 05秒)
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <p className="text-center font-mono text-4xl">
        {formattedMinutes}:{formattedSeconds}
      </p>
      <p className="text-center text-sm mt-1">インターバル</p>
    </div>
  );
}