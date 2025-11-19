export default function Loading() {
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center">
      {/* 脈動するロゴのようなエフェクト */}
      <div className="relative flex items-center justify-center">
        {/* 外側の波紋 */}
        <div className="absolute w-24 h-24 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute w-16 h-16 bg-blue-500 rounded-full opacity-40 animate-pulse"></div>
        
        {/* 中心のコア */}
        <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center">
          {/* シンプルなダンベルアイコン */}
          <svg 
            className="w-6 h-6 text-white animate-bounce" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            style={{ animationDuration: '1.5s' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>

      {/* テキスト */}
      <div className="mt-8 space-y-2 text-center">
        <h2 className="text-xl font-bold text-white tracking-widest animate-pulse">
          AI-STHENICS
        </h2>
        <p className="text-xs text-blue-300 font-mono">
          LOADING YOUR POWER...
        </p>
      </div>
    </div>
  );
}