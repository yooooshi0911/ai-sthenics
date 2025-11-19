/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  // ビルド時のESLintチェックを無視（メモリ節約のためVercel上ではオフにする）
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ビルド時のTypeScript型チェックを無視（メモリ節約のためVercel上ではオフにする）
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // ▼▼▼ 【重要】ここが修正ポイント ▼▼▼
  // ビルドエラーの原因になる特定のファイルをPWAのキャッシュ対象から除外します
  buildExcludes: [/middleware-manifest\.json$/],
})(nextConfig);